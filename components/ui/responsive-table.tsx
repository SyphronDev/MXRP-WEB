"use client";

import { useState } from "react";
import { CardModern } from "@/components/ui/card-modern";
import { ButtonModern } from "@/components/ui/button-modern";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from "lucide-react";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface Action {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: any) => void;
  variant?: "default" | "danger" | "warning";
}

interface ResponsiveTableProps {
  data: any[];
  columns: Column[];
  actions?: Action[];
  searchable?: boolean;
  searchPlaceholder?: string;
  itemsPerPage?: number;
  emptyMessage?: string;
  loading?: boolean;
  className?: string;
}

export function ResponsiveTable({
  data,
  columns,
  actions = [],
  searchable = true,
  searchPlaceholder = "Buscar...",
  itemsPerPage = 10,
  emptyMessage = "No hay datos disponibles",
  loading = false,
  className,
}: ResponsiveTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showMobileActions, setShowMobileActions] = useState<number | null>(null);

  // Filter data based on search term
  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  if (loading) {
    return (
      <CardModern variant="glass" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded"></div>
            ))}
          </div>
        </div>
      </CardModern>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Filters */}
      {searchable && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
            />
          </div>
          <ButtonModern
            variant="outline"
            size="md"
            icon={<Filter className="h-4 w-4" />}
            className="sm:w-auto"
          >
            Filtros
          </ButtonModern>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden lg:block">
        <CardModern variant="glass" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={cn(
                        "px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider",
                        column.sortable && "cursor-pointer hover:text-white",
                        column.width && `w-${column.width}`
                      )}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        {column.label}
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-purple-400">
                            {sortDirection === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">
                      Acciones
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedData.map((row, index) => (
                  <tr key={index} className="hover:bg-white/5 transition-colors">
                    {columns.map((column) => (
                      <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {actions.map((action, actionIndex) => (
                            <ButtonModern
                              key={actionIndex}
                              variant={action.variant === "danger" ? "danger" : "ghost"}
                              size="sm"
                              icon={action.icon}
                              onClick={() => action.onClick(row)}
                              className="text-xs"
                            >
                              {action.label}
                            </ButtonModern>
                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardModern>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4">
        {paginatedData.map((row, index) => (
          <CardModern key={index} variant="glass" className="p-4">
            <div className="space-y-3">
              {columns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-white/60 text-sm font-medium">
                    {column.label}:
                  </span>
                  <span className="text-white text-sm text-right flex-1 ml-2">
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </span>
                </div>
              ))}
              
              {actions.length > 0 && (
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm font-medium">Acciones:</span>
                    <div className="relative">
                      <ButtonModern
                        variant="ghost"
                        size="sm"
                        icon={<MoreVertical className="h-4 w-4" />}
                        onClick={() => setShowMobileActions(showMobileActions === index ? null : index)}
                      />
                      
                      {showMobileActions === index && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-black/95 backdrop-blur-md border border-white/20 rounded-lg shadow-xl z-10">
                          <div className="py-2">
                            {actions.map((action, actionIndex) => (
                              <button
                                key={actionIndex}
                                onClick={() => {
                                  action.onClick(row);
                                  setShowMobileActions(null);
                                }}
                                className={cn(
                                  "w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2",
                                  action.variant === "danger" 
                                    ? "text-red-400 hover:bg-red-400/10" 
                                    : "text-white hover:bg-white/10"
                                )}
                              >
                                {action.icon}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardModern>
        ))}
      </div>

      {/* Empty State */}
      {paginatedData.length === 0 && (
        <CardModern variant="glass" className="p-8 text-center">
          <div className="text-white/40 mb-2">📋</div>
          <h3 className="text-white font-medium mb-1">Sin resultados</h3>
          <p className="text-white/60 text-sm">{emptyMessage}</p>
        </CardModern>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-white/60 text-sm">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, sortedData.length)} de {sortedData.length} resultados
          </div>
          
          <div className="flex items-center gap-2">
            <ButtonModern
              variant="ghost"
              size="sm"
              icon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            />
            
            <div className="flex items-center gap-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <ButtonModern
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </ButtonModern>
                );
              })}
            </div>
            
            <ButtonModern
              variant="ghost"
              size="sm"
              icon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            />
          </div>
        </div>
      )}
    </div>
  );
}