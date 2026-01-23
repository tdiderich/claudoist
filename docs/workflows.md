# Workflows

## Quick call capture

- `claudoist note --customer acme-co --text "..."`
- Generates a note entry in the customer's JSON file

## Make agenda (agent)

- `claudoist agenda --customer acme-co --recent 3 --output data/customers/acme-co.md`
- Uses recent notes to create a Markdown agenda + editable email draft

## Plan from recent calls

- `claudoist plan --customer acme-co --recent 5`
- Summarizes recent notes and suggests agenda items
