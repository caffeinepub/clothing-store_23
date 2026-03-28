import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Edit2, Loader2, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddProduct,
  useDeleteProduct,
  useIsAdmin,
  useOrders,
  useProducts,
  useUpdateOrderStatus,
  useUpdateProduct,
} from "../hooks/useQueries";

const EMPTY_PRODUCT = {
  name: "",
  description: "",
  category: "women",
  price: "",
  sizes: "XS,S,M,L,XL",
  colors: "Black,White,Beige",
  imageUrl: "",
  featured: false,
  stock: "10",
};

type ProductForm = typeof EMPTY_PRODUCT;

function formatPrice(price: bigint): string {
  return `$${(Number(price) / 100).toFixed(2)}`;
}

export function AdminPage() {
  const { identity, login } = useInternetIdentity();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  const { mutateAsync: addProduct, isPending: isAdding } = useAddProduct();
  const { mutateAsync: updateProduct, isPending: isUpdating } =
    useUpdateProduct();
  const { mutateAsync: deleteProduct, isPending: isDeleting } =
    useDeleteProduct();
  const { mutateAsync: updateOrderStatus } = useUpdateOrderStatus();

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT);

  if (!identity) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="admin.panel"
      >
        <h1 className="font-display text-3xl font-bold mb-4">Admin Panel</h1>
        <p className="text-muted-foreground mb-8">
          Please sign in to access the admin panel.
        </p>
        <Button
          onClick={login}
          className="text-xs tracking-widest uppercase px-8"
          data-ocid="admin.primary_button"
        >
          Sign In
        </Button>
      </main>
    );
  }

  if (isAdminLoading) {
    return (
      <main
        className="container mx-auto px-4 py-10"
        data-ocid="admin.loading_state"
      >
        <Skeleton className="h-10 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main
        className="container mx-auto px-4 py-20 text-center"
        data-ocid="admin.error_state"
      >
        <h1 className="font-display text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-muted-foreground">
          You don't have admin privileges.
        </p>
      </main>
    );
  }

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      category: product.category,
      price: (Number(product.price) / 100).toString(),
      sizes: product.sizes.join(","),
      colors: product.colors.join(","),
      imageUrl: product.imageUrl,
      featured: product.featured,
      stock: product.stock.toString(),
    });
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(EMPTY_PRODUCT);
    setShowAddForm(true);
  };

  const buildProductPayload = (base: Product | null): Product => ({
    id: base?.id ?? 0n,
    name: form.name,
    description: form.description,
    category: form.category,
    price: BigInt(Math.round(Number.parseFloat(form.price) * 100)),
    sizes: form.sizes
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    colors: form.colors
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean),
    imageUrl: form.imageUrl,
    featured: form.featured,
    stock: BigInt(Number.parseInt(form.stock) || 0),
  });

  const handleSave = async () => {
    try {
      if (editingProduct) {
        await updateProduct({
          id: editingProduct.id,
          product: buildProductPayload(editingProduct),
        });
        toast.success("Product updated");
        setEditingProduct(null);
      } else {
        await addProduct(buildProductPayload(null));
        toast.success("Product added");
        setShowAddForm(false);
      }
      setForm(EMPTY_PRODUCT);
    } catch {
      toast.error("Failed to save product");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleStatusChange = async (orderId: bigint, status: string) => {
    try {
      await updateOrderStatus({ id: orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const isSaving = isAdding || isUpdating;

  return (
    <main className="container mx-auto px-4 py-10" data-ocid="admin.panel">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-1">
            Management
          </p>
          <h1 className="font-display text-4xl font-bold">Admin Panel</h1>
        </div>
      </div>

      <Tabs defaultValue="products" data-ocid="admin.tab">
        <TabsList className="mb-8">
          <TabsTrigger
            value="products"
            className="text-xs tracking-wide"
            data-ocid="admin.tab"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="text-xs tracking-wide"
            data-ocid="admin.tab"
          >
            Orders
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-muted-foreground">
              {products?.length ?? 0} products
            </p>
            <Button
              onClick={openAddForm}
              size="sm"
              className="text-xs tracking-widest uppercase gap-1"
              data-ocid="admin.open_modal_button"
            >
              <Plus className="w-4 h-4" /> Add Product
            </Button>
          </div>

          {productsLoading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Product
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Category
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Price
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Stock
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Featured
                    </TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(products ?? []).map((product, i) => (
                    <TableRow
                      key={product.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {product.stock.toString()}
                      </TableCell>
                      <TableCell>
                        {product.featured && (
                          <Badge className="text-xs bg-foreground text-background">
                            Yes
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(product)}
                            data-ocid={`admin.edit_button.${i + 1}`}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                disabled={isDeleting}
                                data-ocid={`admin.delete_button.${i + 1}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Product
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "
                                  {product.name}"? This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="admin.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-ocid="admin.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {ordersLoading ? (
            <div className="space-y-3" data-ocid="admin.loading_state">
              {Array.from({ length: 5 }).map((_, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholder
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (orders ?? []).length === 0 ? (
            <div
              className="text-center py-20 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              No orders yet.
            </div>
          ) : (
            <div className="border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Order ID
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Customer
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Total
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Status
                    </TableHead>
                    <TableHead className="text-xs tracking-widest uppercase">
                      Update Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(orders ?? []).map((order, i) => (
                    <TableRow
                      key={order.id.toString()}
                      data-ocid={`admin.row.${i + 1}`}
                    >
                      <TableCell className="text-sm font-mono">
                        #{order.id.toString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{order.customerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.customerEmail}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            order.status === "delivered" ? "default" : "outline"
                          }
                          className="text-xs capitalize"
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(v) => handleStatusChange(order.id, v)}
                        >
                          <SelectTrigger
                            className="w-36 text-xs h-8"
                            data-ocid={`admin.select.${i + 1}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">
                              Processing
                            </SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog
        open={showAddForm || !!editingProduct}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddForm(false);
            setEditingProduct(null);
          }
        }}
      >
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto"
          data-ocid="admin.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Name
                </Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Category
                </Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm((p) => ({ ...p, category: v }))}
                >
                  <SelectTrigger data-ocid="admin.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="women">Women</SelectItem>
                    <SelectItem value="men">Men</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Price ($)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, price: e.target.value }))
                  }
                  placeholder="99.99"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Stock
                </Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, stock: e.target.value }))
                  }
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Sizes (comma-separated)
                </Label>
                <Input
                  value={form.sizes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, sizes: e.target.value }))
                  }
                  placeholder="XS,S,M,L,XL"
                  data-ocid="admin.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Colors (comma-separated)
                </Label>
                <Input
                  value={form.colors}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, colors: e.target.value }))
                  }
                  placeholder="Black,White,Beige"
                  data-ocid="admin.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Image URL
                </Label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, imageUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  data-ocid="admin.input"
                />
              </div>
              <div className="col-span-2 space-y-1">
                <Label className="text-xs tracking-widest uppercase">
                  Description
                </Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={3}
                  data-ocid="admin.textarea"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, featured: e.target.checked }))
                  }
                  className="w-4 h-4"
                  data-ocid="admin.checkbox"
                />
                <Label
                  htmlFor="featured-check"
                  className="text-sm cursor-pointer"
                >
                  Featured product
                </Label>
              </div>
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddForm(false);
                setEditingProduct(null);
              }}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              data-ocid="admin.save_button"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                "Save Product"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
