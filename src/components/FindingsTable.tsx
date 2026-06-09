import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";

export function FindingsTable({ findings }: { findings: any[] }) {
  if (!findings || findings.length === 0) {
    return <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-md">No findings reported.</div>;
  }

  return (
    <div className="border border-neutral-800 rounded-md">
      <Table>
        <TableHeader className="bg-neutral-900/50">
          <TableRow className="border-neutral-800 hover:bg-transparent">
            <TableHead className="w-[100px] text-neutral-400">Severity</TableHead>
            <TableHead className="text-neutral-400">File</TableHead>
            <TableHead className="w-[80px] text-neutral-400">Line</TableHead>
            <TableHead className="text-neutral-400">Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((finding, idx) => (
            <TableRow key={idx} className="border-neutral-800 hover:bg-neutral-900/50">
              <TableCell>
                <StatusBadge status={finding.severity} />
              </TableCell>
              <TableCell className="font-mono text-xs text-neutral-300">
                {finding.filePath}
              </TableCell>
              <TableCell className="font-mono text-xs text-neutral-400">
                {finding.line ? `L${finding.line}` : "-"}
              </TableCell>
              <TableCell className="text-sm text-neutral-300">
                {finding.message}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
