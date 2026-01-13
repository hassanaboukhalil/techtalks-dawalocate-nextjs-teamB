import * as React from "react"
import { Pencil, Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* ======================================================
   BASE TABLE CONTAINER
====================================================== */

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      className={cn(
        "relative w-full overflow-x-auto rounded-xl",
        // ✨ NO BLACK BORDER — soft surface separation
        "bg-white",
        "ring-1 ring-slate-200/70",
        "shadow-[0_6px_18px_rgba(15,23,42,0.06)]"
      )}
    >
      <table
        data-slot="table"
        className={cn("w-full border-collapse text-sm", className)}
        {...props}
      />
    </div>
  )
}

/* ======================================================
   TABLE SECTIONS
====================================================== */

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "sticky top-0 z-20",
        // ✨ Header as a surface, not boxed
        "bg-slate-50/80 backdrop-blur",
        "border-b border-slate-200/80",
        className
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-b-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-slate-200/80",
        "bg-slate-50/60 font-medium",
        className
      )}
      {...props}
    />
  )
}

/* ======================================================
   ROWS & CELLS
====================================================== */

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        // ✨ very light row separation
        "border-b border-slate-100",
        "transition-colors duration-150",
        "hover:bg-slate-50/70",
        "data-[state=selected]:bg-indigo-50",
        className
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------
   HEADER CELL — TITLES, NOT TEXT
------------------------------------------------------ */

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-14 px-6 text-left align-middle",
        // ✨ Title styling
        "text-[11px] font-extrabold uppercase tracking-[0.14em]",
        "text-slate-500",
        "whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-6 py-4 align-middle",
        "text-sm text-slate-700",
        "[&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-slate-500", className)}
      {...props}
    />
  )
}

/* ======================================================
   TABLE ACTIONS
====================================================== */

interface TableActionsProps {
  onEdit?: () => void
  onDelete?: () => void
  editLabel?: string
  deleteLabel?: string
  showEdit?: boolean
  showDelete?: boolean
  disabled?: boolean
  className?: string
}

function TableActions({
  onEdit,
  onDelete,
  editLabel = "Edit",
  deleteLabel = "Delete",
  showEdit = true,
  showDelete = true,
  disabled = false,
  className,
}: TableActionsProps) {
  return (
    <div
      data-slot="table-actions"
      className={cn(
        "inline-flex items-center gap-1.5",
        "rounded-lg",
        // ✨ subtle container, not boxed
        "bg-slate-50/80",
        "ring-1 ring-slate-200/70",
        "p-1.5",
        className
      )}
    >
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          disabled={disabled}
          aria-label={editLabel}
          title={editLabel}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}

      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          disabled={disabled}
          aria-label={deleteLabel}
          title={deleteLabel}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}

/* ======================================================
   EMPTY STATE (HTML + SSR SAFE)
====================================================== */

interface TableEmptyProps {
  message?: string
  icon?: React.ReactNode
  className?: string
}

function TableEmpty({
  message = "No data available",
  icon,
  className,
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={100} className={cn("h-44 text-center", className)}>
        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
          {icon}
          <p className="text-sm font-medium">{message}</p>
        </div>
      </TableCell>
    </TableRow>
  )
}

/* ======================================================
   EXPORTS
====================================================== */

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableActions,
  TableEmpty,
}

export type { TableActionsProps, TableEmptyProps }


/*
==================== USAGE EXAMPLES ====================

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableActions,
  TableEmpty,
} from "@/components/ui/table"

// ==================== Example 1: Basic Table with Actions ====================

<Table>
  <TableCaption>A list of your medicines.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Generic Name</TableHead>
      <TableHead>Strength</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="w-[100px]">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {medicines.map((medicine) => (
      <TableRow key={medicine.id}>
        <TableCell className="font-medium">{medicine.name}</TableCell>
        <TableCell>{medicine.genericName}</TableCell>
        <TableCell>{medicine.strength}</TableCell>
        <TableCell>{medicine.status}</TableCell>
        <TableCell>
          <TableActions
            onEdit={() => handleEdit(medicine.id)}
            onDelete={() => handleDelete(medicine.id)}
            editLabel={`Edit ${medicine.name}`}
            deleteLabel={`Delete ${medicine.name}`}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// ==================== Example 2: Table with Empty State ====================

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Pharmacy Name</TableHead>
      <TableHead>City</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {pharmacies.length === 0 ? (
      <TableEmpty
        message="No pharmacies found"
        icon={<PackageOpen className="h-10 w-10" />}
      />
    ) : (
      pharmacies.map((pharmacy) => (
        <TableRow key={pharmacy.id}>
          <TableCell>{pharmacy.name}</TableCell>
          <TableCell>{pharmacy.city}</TableCell>
          <TableCell>{pharmacy.status}</TableCell>
          <TableCell>
            <TableActions
              onEdit={() => handleEdit(pharmacy.id)}
              onDelete={() => handleDelete(pharmacy.id)}
            />
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>

// ==================== Example 3: Table with Conditional Actions ====================

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Campaign Title</TableHead>
      <TableHead>Target Area</TableHead>
      <TableHead>Start Date</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {campaigns.map((campaign) => (
      <TableRow key={campaign.id}>
        <TableCell>{campaign.title}</TableCell>
        <TableCell>{campaign.targetAreas}</TableCell>
        <TableCell>{new Date(campaign.startDate).toLocaleDateString()}</TableCell>
        <TableCell>
          <TableActions
            onEdit={() => handleEdit(campaign.id)}
            onDelete={() => handleDelete(campaign.id)}
            showEdit={campaign.status !== 'COMPLETED'}
            showDelete={userRole === 'admin' || campaign.charityUserId === userId}
            disabled={campaign.isArchived}
          />
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// ==================== Example 4: Custom Actions (No Built-in Buttons) ====================

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Request</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {requests.map((request) => (
      <TableRow key={request.id}>
        <TableCell>{request.medicineName}</TableCell>
        <TableCell>{request.status}</TableCell>
        <TableCell>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApprove(request.id)}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleReject(request.id)}
            >
              Reject
            </Button>
          </div>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>

// ==================== TypeScript Usage ====================

// Define your data type
interface Medicine {
  id: number
  name: string
  genericName: string
  strength: string
  status: 'IN_STOCK' | 'LOW' | 'OUT'
}

// Use with type safety
const MedicineTable = ({ medicines }: { medicines: Medicine[] }) => {
  const handleEdit = (id: number) => {
    console.log('Edit medicine:', id)
  }

  const handleDelete = (id: number) => {
    console.log('Delete medicine:', id)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {medicines.map((medicine) => (
          <TableRow key={medicine.id}>
            <TableCell>{medicine.name}</TableCell>
            <TableCell>{medicine.status}</TableCell>
            <TableCell>
              <TableActions
                onEdit={() => handleEdit(medicine.id)}
                onDelete={() => handleDelete(medicine.id)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
*/

