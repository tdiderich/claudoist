import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  Input,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import type { CustomerSummary as CustomerListItem } from "./data/sample";

const statusLabels: Record<CustomerListItem["status"], string> = {
  open: "Open",
  in_progress: "Active",
  done: "Done"
};

const statusColors: Record<CustomerListItem["status"], string> = {
  open: "ember.500",
  in_progress: "slate.700",
  done: "slate.400"
};

const groupByStatus = (customers: CustomerListItem[]) => {
  return customers.reduce(
    (acc, customer) => {
      acc[customer.status].push(customer);
      return acc;
    },
    { open: [], in_progress: [], done: [] } as Record<CustomerListItem["status"], CustomerListItem[]>
  );
};

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4310";

const fetchJson = async <T,>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
};

type CustomerDetail = {
  customerId: string;
  customerName: string;
  updatedAt: string;
  todos: Array<{
    id: string;
    status: "open" | "in_progress" | "done" | "blocked";
    title: string;
    details?: string | null;
  }>;
  callDocs: Array<{
    id: string;
    title: string;
    markdown?: string | null;
    emailDraft?: string | null;
  }>;
};

const App = () => {
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedDetail, setSelectedDetail] = useState<CustomerDetail | null>(null);
  const [markdown, setMarkdown] = useState<string>("Select a customer to view notes.");
  const [loading, setLoading] = useState(true);
  const [agendaLoading, setAgendaLoading] = useState(false);
  const [formId, setFormId] = useState("");
  const [formName, setFormName] = useState("");
  const [todoTitle, setTodoTitle] = useState("");
  const [todoDetails, setTodoDetails] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchJson<
          Array<{ customerId: string; customerName: string; updatedAt: string; openTodoCount: number; lastCallAt: string | null }>
        >(`${apiBase}/api/customers`);
        const mapped: CustomerListItem[] = data.map((entry) => ({
          id: entry.customerId,
          name: entry.customerName,
          account: "Account",
          status: entry.openTodoCount > 0 ? "in_progress" : "open",
          nextCall: entry.lastCallAt ? new Date(entry.lastCallAt).toLocaleString() : "No recent calls",
          notes: []
        }));
        setCustomers(mapped);
        if (mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const selected = customers.find((customer) => customer.id === selectedId) ?? null;
  const grouped = useMemo(() => groupByStatus(customers), [customers]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selectedId) {
        setSelectedDetail(null);
        return;
      }
      try {
        const detail = await fetchJson<CustomerDetail>(`${apiBase}/api/customers/${selectedId}`);
        setSelectedDetail(detail);
      } catch (err) {
        setError((err as Error).message);
      }
    };
    loadDetail();
  }, [selectedId]);

  const handleMakeAgenda = async () => {
    if (!selected) {
      return;
    }
    try {
      setAgendaLoading(true);
      const agenda = await fetchJson<{ markdown: string }>(`${apiBase}/api/customers/${selected.id}/agenda`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recent: 3 })
      });
      setMarkdown(agenda.markdown);
      const detail = await fetchJson<CustomerDetail>(`${apiBase}/api/customers/${selected.id}`);
      setSelectedDetail(detail);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAgendaLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!formId || !formName) {
      setError("Customer ID and name are required.");
      return;
    }
    try {
      const created = await fetchJson<CustomerDetail>(`${apiBase}/api/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: formId, customerName: formName })
      });
      setCustomers((prev) => [
        ...prev,
        {
          id: created.customerId,
          name: created.customerName,
          account: "Account",
          status: "open",
          nextCall: "No recent calls",
          notes: []
        }
      ]);
      setSelectedId(created.customerId);
      setFormId("");
      setFormName("");
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAddTodo = async () => {
    if (!selected || !todoTitle) {
      setError("Select a customer and enter a todo title.");
      return;
    }
    try {
      await fetchJson(`${apiBase}/api/customers/${selected.id}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: todoTitle, details: todoDetails || null })
      });
      const detail = await fetchJson<CustomerDetail>(`${apiBase}/api/customers/${selected.id}`);
      setSelectedDetail(detail);
      setTodoTitle("");
      setTodoDetails("");
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleTodoStatus = async (todoId: string, status: CustomerDetail["todos"][number]["status"]) => {
    if (!selected) {
      return;
    }
    try {
      await fetchJson(`${apiBase}/api/customers/${selected.id}/todos/${todoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const detail = await fetchJson<CustomerDetail>(`${apiBase}/api/customers/${selected.id}`);
      setSelectedDetail(detail);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <Box px={{ base: 4, md: 10 }} py={{ base: 6, md: 10 }}>
      <Stack spacing={10}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "flex-start", lg: "center" }}
          justify="space-between"
          gap={6}
        >
          <Stack spacing={3} maxW="680px">
            <Badge w="fit-content" px={3} py={1} borderRadius="full" bg="ember.500" color="white">
              Call-first workflow
            </Badge>
            <Heading fontSize={{ base: "3xl", md: "4xl" }}>
              Claudoist keeps call prep, notes, and follow-ups tight.
            </Heading>
            <Text fontSize={{ base: "md", md: "lg" }} color="slate.700">
              Capture raw notes mid-call, then generate a clean agenda and email summary in one click.
            </Text>
            {error && (
              <Badge colorScheme="red" w="fit-content">
                {error}
              </Badge>
            )}
          </Stack>
          <Box
            bg="white"
            borderRadius="24px"
            p={6}
            boxShadow="0 24px 60px rgba(11, 28, 28, 0.12)"
            minW={{ base: "100%", lg: "320px" }}
          >
            <Text fontSize="sm" letterSpacing="0.08em" textTransform="uppercase" color="slate.500">
              Today
            </Text>
            <Heading fontSize="2xl" mt={2}>
              {customers.length} customers · {customers.reduce((sum, customer) => sum + (customer.status !== "done" ? 1 : 0), 0)} active
            </Heading>
            <Divider my={4} borderColor="slate.200" />
            <Stack spacing={3}>
              {customers.slice(0, 2).map((customer) => (
                <Flex key={customer.id} justify="space-between" align="center">
                  <Text fontWeight={600}>{customer.name}</Text>
                  <Text fontSize="sm" color="slate.500">
                    {customer.nextCall}
                  </Text>
                </Flex>
              ))}
            </Stack>
          </Box>
        </Flex>

        <Stack spacing={6}>
          <Heading fontSize={{ base: "2xl", md: "3xl" }}>Customer list</Heading>
          <Stack spacing={3}>
            {loading && <Text color="slate.500">Loading customers...</Text>}
            {!loading && customers.length === 0 && <Text color="slate.500">No customers found.</Text>}
            <Box bg="white" borderRadius="16px" p={4} border="1px solid" borderColor="slate.200">
              <Stack spacing={3}>
                <Text fontWeight={600}>Add customer</Text>
                <Input placeholder="Customer ID (acme-co)" value={formId} onChange={(event) => setFormId(event.target.value)} />
                <Input placeholder="Customer name" value={formName} onChange={(event) => setFormName(event.target.value)} />
                <Button bg="slate.800" color="white" _hover={{ bg: "slate.700" }} onClick={handleCreateCustomer}>
                  Create customer
                </Button>
              </Stack>
            </Box>
            {customers.map((customer) => (
              <Flex
                key={customer.id}
                p={4}
                borderRadius="16px"
                bg={customer.id === selectedId ? "white" : "transparent"}
                boxShadow={customer.id === selectedId ? "0 12px 30px rgba(11, 28, 28, 0.08)" : "none"}
                border="1px solid"
                borderColor="slate.200"
                justify="space-between"
                align={{ base: "flex-start", md: "center" }}
                direction={{ base: "column", md: "row" }}
                gap={3}
                cursor="pointer"
                onClick={() => setSelectedId(customer.id)}
              >
                <Stack spacing={1}>
                  <Heading fontSize="lg">{customer.name}</Heading>
                  <Text color="slate.600">{customer.account} · Next call {customer.nextCall}</Text>
                </Stack>
                <Badge bg={statusColors[customer.status]} color="white" px={3} py={1} borderRadius="full">
                  {statusLabels[customer.status]}
                </Badge>
              </Flex>
            ))}
          </Stack>
        </Stack>

        <Stack spacing={6}>
          <Heading fontSize={{ base: "2xl", md: "3xl" }}>Status board</Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            {(["open", "in_progress", "done"] as const).map((status) => (
              <Box key={status} bg="white" borderRadius="20px" p={4} boxShadow="0 18px 40px rgba(11, 28, 28, 0.08)">
                <HStack justify="space-between" mb={3}>
                  <Text fontWeight={700}>{statusLabels[status]}</Text>
                  <Badge bg={statusColors[status]} color="white" borderRadius="full">
                    {grouped[status].length}
                  </Badge>
                </HStack>
                <Stack spacing={3}>
                  {grouped[status].map((customer) => (
                    <Box key={customer.id} p={3} borderRadius="14px" bg="slate.50">
                      <Text fontWeight={600}>{customer.name}</Text>
                      <Text fontSize="sm" color="slate.600">
                        {customer.nextCall}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Stack>

        {selected && (
          <Stack spacing={6}>
            <Flex
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={3}
            >
              <Stack spacing={1}>
                <Heading fontSize={{ base: "2xl", md: "3xl" }}>{selected.name}</Heading>
                <Text color="slate.600">Call prep workspace · {selected.nextCall}</Text>
              </Stack>
              <Button
                bg="ember.500"
                color="white"
                _hover={{ bg: "ember.600" }}
                onClick={handleMakeAgenda}
                isLoading={agendaLoading}
              >
                Make agenda
              </Button>
            </Flex>
            <Stack spacing={4} bg="white" borderRadius="20px" p={{ base: 4, md: 6 }} boxShadow="0 18px 40px rgba(11, 28, 28, 0.08)">
              <Heading fontSize="xl">Todos</Heading>
              <Stack spacing={3}>
                {selectedDetail?.todos?.length ? (
                  selectedDetail.todos.map((todo) => (
                    <Box key={todo.id} p={3} borderRadius="14px" bg="slate.50">
                      <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={2}>
                        <Stack spacing={1}>
                          <Text fontWeight={600}>{todo.title}</Text>
                          {todo.details && <Text color="slate.600">{todo.details}</Text>}
                        </Stack>
                        <HStack spacing={2}>
                          {(["open", "in_progress", "done", "blocked"] as const).map((status) => (
                            <Button
                              key={status}
                              size="xs"
                              variant={todo.status === status ? "solid" : "outline"}
                              colorScheme={todo.status === status ? "orange" : "gray"}
                              onClick={() => handleTodoStatus(todo.id, status)}
                            >
                              {status.replace("_", " ")}
                            </Button>
                          ))}
                        </HStack>
                      </Flex>
                    </Box>
                  ))
                ) : (
                  <Text color="slate.500">No todos yet.</Text>
                )}
              </Stack>
              <Divider borderColor="slate.200" />
              <Stack spacing={3}>
                <Text fontWeight={600}>Add todo</Text>
                <Input placeholder="Todo title" value={todoTitle} onChange={(event) => setTodoTitle(event.target.value)} />
                <Input placeholder="Details (optional)" value={todoDetails} onChange={(event) => setTodoDetails(event.target.value)} />
                <Button bg="slate.800" color="white" _hover={{ bg: "slate.700" }} onClick={handleAddTodo}>
                  Add todo
                </Button>
              </Stack>
            </Stack>
            <Stack spacing={4} bg="white" borderRadius="20px" p={{ base: 4, md: 6 }} boxShadow="0 18px 40px rgba(11, 28, 28, 0.08)">
              <Heading fontSize="xl">Agendas</Heading>
              <Stack spacing={3}>
                {selectedDetail?.callDocs?.length ? (
                  selectedDetail.callDocs.map((doc) => (
                    <Flex key={doc.id} justify="space-between" align="center" gap={3}>
                      <Text fontWeight={600}>{doc.title}</Text>
                      <Button size="sm" onClick={() => setMarkdown(doc.markdown ?? "")}>
                        View
                      </Button>
                    </Flex>
                  ))
                ) : (
                  <Text color="slate.500">No agendas yet.</Text>
                )}
              </Stack>
            </Stack>
            <Box bg="white" borderRadius="20px" p={{ base: 4, md: 6 }} boxShadow="0 18px 40px rgba(11, 28, 28, 0.08)">
              <ReactMarkdown>{markdown}</ReactMarkdown>
            </Box>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default App;
