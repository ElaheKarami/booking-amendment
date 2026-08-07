# Voyages

## Purpose

Provide voyage options for the amendment form after changes to Port of Discharge or cargo readiness date.

## Goals

- Load voyage options.
- Support a search input.
- Use the selected voyage for cargo-readiness and 40HC compatibility validation.
- Prevent stale assessment after a voyage change.
- Account for large search result sets.

## Entry Points

- Booking Amendment Workspace → Planned voyage

## Components

- Voyage selection
- Voyage search

## Dependencies

- Booking Port of Loading
- Draft Port of Discharge
- Draft cargo readiness date
- Voyage API
