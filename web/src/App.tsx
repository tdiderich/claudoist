import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import { sampleCustomers, sampleMarkdown, type CustomerSummary } from "./data/sample";

const statusLabels: Record<CustomerSummary["status"], string> = {
  open: "Open",
  in_progress: "Active",
  done: "Done"
};

const statusColors: Record<CustomerSummary["status"], string> = {
  open: "ember.500",
  in_progress: "slate.700",
  done: "slate.400"
};

const buildAgendaMarkdown = (customer: CustomerSummary): string => {
  const noteLines = customer.notes.map((note) => `- ${note}`);
  return `# ${customer.name} - Call agenda\n\n## Agenda\n- Review last action items\n- Open questions\n- Next steps\n\n## Recent Notes\n${noteLines.join("\n")}\n\n## Email Draft\nHi team,\n\nSharing a draft agenda for the ${customer.name} call. Add anything I missed.\n`;
};

const groupByStatus = (customers: CustomerSummary[]) => {
  return customers.reduce(
    (acc, customer) => {
      acc[customer.status].push(customer);
      return acc;
    },
    { open: [], in_progress: [], done: [] } as Record<CustomerSummary["status"], CustomerSummary[]>
  );
};

const App = () => {
  const [selectedId, setSelectedId] = useState(sampleCustomers[0]?.id ?? "");
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const selected = sampleCustomers.find((customer) => customer.id === selectedId) ?? sampleCustomers[0];

  const grouped = useMemo(() => groupByStatus(sampleCustomers), []);

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
              4 calls · 11 tasks
            </Heading>
            <Divider my={4} borderColor="slate.200" />
            <Stack spacing={3}>
              {sampleCustomers.slice(0, 2).map((customer) => (
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
            {sampleCustomers.map((customer) => (
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
            <Flex justify="space-between" align={{ base: "flex-start", md: "center" }} direction={{ base: "column", md: "row" }} gap={3}>
              <Stack spacing={1}>
                <Heading fontSize={{ base: "2xl", md: "3xl" }}>{selected.name}</Heading>
                <Text color="slate.600">Call prep workspace · {selected.nextCall}</Text>
              </Stack>
              <Button
                bg="ember.500"
                color="white"
                _hover={{ bg: "ember.600" }}
                onClick={() => setMarkdown(buildAgendaMarkdown(selected))}
              >
                Make agenda
              </Button>
            </Flex>
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
