# Workflows

## Quick call capture

- `claudoist note --customer acme-co --text "..."`
- Generates a note entry in the customer's JSON file

## Create a customer

- `claudoist customer create --id acme-co --name "Acme Co"`

## Manage todos

- `claudoist todo add --customer acme-co --title "Send recap" --details "Email summary"`
- `claudoist todo status --customer acme-co --todo <todo-id> --status done`

## Agent context + ingest

- `claudoist context --customer acme-co --recent 5`
- Run your preferred agent CLI using the generated prompt file
- `claudoist ingest --customer acme-co --input <agent-output.json>`

## UI + API server

- `claudoist serve --data-dir data`
- Web UI expects the API on `http://localhost:4310` by default

## Make agenda (agent)

- `claudoist agenda --customer acme-co --recent 3 --output data/customers/acme-co.md`
- Uses recent notes to create a Markdown agenda + editable email draft

## Plan from recent calls

- `claudoist plan --customer acme-co --recent 5`
- Summarizes recent notes and suggests agenda items
