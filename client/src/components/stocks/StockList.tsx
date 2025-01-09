import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Plus, Minus } from 'lucide-react';
import { Stock } from '@/types/stock.types';
import { formatDate } from '@/lib/utils';

interface StockListProps {
  stocks: Stock[];
  onUpdateQuantity?: (stock: Stock) => void;
  onEdit?: (stock: Stock) => void;
}

const StockList: React.FC<StockListProps> = ({ stocks, onUpdateQuantity, onEdit }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün Adı</TableHead>
            <TableHead>Miktar</TableHead>
            <TableHead>Birim</TableHead>
            <TableHead>Alt Limit</TableHead>
            <TableHead>Son Güncelleme</TableHead>
            <TableHead>Son Kullanma</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.id}>
              <TableCell className="font-medium">{stock.product.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{stock.quantity}</span>
                  {stock.lowStockThreshold && stock.quantity <= stock.lowStockThreshold && (
                    <Badge variant="destructive">Düşük Stok</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{stock.product.unit}</TableCell>
              <TableCell>{stock.lowStockThreshold || '-'}</TableCell>
              <TableCell>{formatDate(stock.lastStockUpdate)}</TableCell>
              <TableCell>
                {stock.expirationDate ? (
                  formatDate(stock.expirationDate)
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onUpdateQuantity?.(stock)}
                    title="Stok Ekle/Çıkar"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit?.(stock)}
                    title="Düzenle"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StockList; 