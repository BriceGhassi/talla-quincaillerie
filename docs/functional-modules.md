# Functional Modules

## 1. Inventory and Stock Management

Features:

- Product catalog with SKU, barcode, unit, category, brand, supplier reference,
  tax rate, cost, selling price, reorder level, and active status.
- Multi-location stock balances for store, warehouse, and workshop.
- Real-time theoretical stock from stock movement ledger.
- Minimum stock alerts and reorder suggestions.
- Stock counts with variance approval.
- Transfers between locations.
- Batch/lot tracking where needed for manufactured or serialized products.
- Stock valuation by weighted average cost.

Key workflows:

1. Create or import product master data.
2. Receive supplier delivery into warehouse.
3. Move stock to store or production workshop.
4. Sell, consume, produce, adjust, or count stock.
5. Review alerts and reorder.

## 2. POS and Sales

Features:

- Fast cashier screen optimized for barcode scanning.
- Barcode scanner input through keyboard wedge.
- Product lookup by barcode, SKU, name, or category.
- Cart with discounts, tax, customer selection, and payment split.
- Cash, mobile money, bank card, credit, and mixed payments.
- Receipt/ticket printing.
- Returns and exchanges with manager approval.
- Shift opening/closing, cash drawer reconciliation, and cashier summary.
- Offline sale capture with deferred sync.

Offline rule:

Cashiers may complete sales offline if product and price data are cached.
Offline receipt numbers include `location_code-device_code-sequence` to prevent
duplicates.

## 3. Manufacturing and Production

Features:

- Bill of materials (BOM) for manufactured items.
- Production order creation, planning, release, start, pause, complete, cancel.
- Raw material reservation and consumption.
- Finished goods receipt into stock.
- Scrap/waste tracking.
- Labor time capture by employee or work center.
- Production cost calculation: materials + labor + overhead.
- Productivity reporting.

Production states:

`draft -> planned -> released -> in_progress -> completed -> costed -> closed`

## 4. Purchasing and Suppliers

Features:

- Supplier master data.
- Purchase requests and purchase orders.
- Goods receipt against PO.
- Supplier invoice registration.
- Payment tracking.
- Supplier performance reporting.

Inventory impact:

Goods receipts create `purchase_receipt` stock movements. Supplier returns create
negative movements and accounting adjustments.

## 5. Customers and Transactions

Features:

- Customer profiles.
- Customer category and credit limit.
- Sales invoices, receipts, returns, and payments.
- Customer statement.
- Outstanding balance and aging report.

Credit sales:

Cashiers can create credit sales only if permission allows and the customer is
within credit limit, or if a manager approves.

## 6. Finance and OHADA Accounting

Features:

- Cash, mobile money, card, and bank accounts.
- Posted sales, purchases, payments, expenses, and payroll summaries.
- Journal entries with OHADA account mapping.
- Daily cash report and financial dashboard.
- Tax reporting and export.
- Immutable posted documents with reversal workflow.

## 7. Human Resources

Features:

- Employee records.
- Role assignment and store/workshop assignment.
- Time tracking.
- Production labor capture.
- Productivity metrics.

## 8. Reporting and Analytics

Dashboards:

- Sales by day, cashier, location, category, and payment method.
- Stock value and slow-moving products.
- Minimum stock alerts.
- Production output, scrap, labor, and cost variance.
- Purchase commitments and supplier reliability.
- Cash position and customer balances.

Reports must export to CSV and PDF.

## 9. Administration

Features:

- Users, roles, permissions.
- Store locations, warehouses, devices, and POS terminals.
- Numbering sequences.
- Taxes, currencies, payment methods.
- Product categories and price lists.
- Sync policy and offline session duration.
- Audit log review.

