import type {
  WorkOrderListItem,
} from "../actions";

import {
  getInitials,
} from "./work-order-pricing.helpers";

type WorkOrderPricingCustomerSummaryProps = {
  order: WorkOrderListItem;
};

export default function WorkOrderPricingCustomerSummary({
  order,
}: WorkOrderPricingCustomerSummaryProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-white">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-sky-600 text-xl font-bold text-white shadow-sm">
            {getInitials(
              order.customerName,
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="break-words text-xl font-bold leading-tight text-slate-950 sm:text-2xl">
              {
                order.customerName
              }
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="truncate">
                {order.title}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}