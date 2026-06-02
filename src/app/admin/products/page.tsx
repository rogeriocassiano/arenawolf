"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, X, Trash2, Edit2, Package, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

const CATEGORIES = ["Bebida", "Snack", "Periférico", "Acessório", "Combo", "Outro"];

type Product = {
  id: string; name: string; description?: string; price: number;
  stock: number; category?: string; image_url?: string; active: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category: "Bebida", image_url: "" });

  const supabase = createClient();

  useEffect(() => {
    supabase.from("products").select("*").order("category").order("name").then(({ data }) => {
      setProducts(data ?? []);
      setLoading(false);
    });
  }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", description: "", price: "", stock: "", category: "Bebida", image_url: "" });
    setShowCreate(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), stock: String(p.stock), category: p.category ?? "Outro", image_url: p.image_url ?? "" });
    setShowCreate(true);
  }

  async function toggleActive(p: Product) {
    await supabase.from("products").update({ active: !p.active }).eq("id", p.id);
    setProducts(prev => prev.map(pr => pr.id === p.id ? { ...pr, active: !pr.active } : pr));
  }

  async function deleteProduct(id: string) {
    if (!confirm("Excluir produto?")) return;
    await supabase.from("products").delete().eq("id", id);
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: form.name, description: form.description, price: Number(form.price),
      stock: Number(form.stock), category: form.category, image_url: form.image_url || null,
    };
    if (editing) {
      const { data } = await supabase.from("products").update(payload).eq("id", editing.id).select().single();
      if (data) setProducts(prev => prev.map(p => p.id === editing.id ? { ...p, ...data } : p));
    } else {
      const { data } = await supabase.from("products").insert({ ...payload, active: true }).select().single();
      if (data) setProducts(prev => [data, ...prev]);
    }
    setSaving(false);
    setShowCreate(false);
  }

  const categories = [...new Set(products.map(p => p.category ?? "Outro"))];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-orbitron)] text-2xl font-bold text-wolf-white tracking-wide">Produtos</h1>
          <p className="text-wolf-muted text-sm mt-1">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0"><Plus className="size-4" /> Novo Produto</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Total</p>
          <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-white">{products.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Ativos</p>
          <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-emerald-400">{products.filter(p => p.active).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Sem Estoque</p>
          <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-red">{products.filter(p => p.stock === 0).length}</p>
        </div>
        <div className="p-4 rounded-xl bg-wolf-surface border border-wolf-blue/15">
          <p className="text-xs text-wolf-muted">Categorias</p>
          <p className="font-[family-name:var(--font-orbitron)] font-black text-2xl text-wolf-blue-light">{categories.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-wolf-muted text-sm">Carregando...</div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <ShoppingBag className="size-12 text-wolf-muted/30" />
          <p className="text-wolf-muted text-sm">Nenhum produto cadastrado</p>
          <Button variant="outline" size="sm" onClick={openCreate}><Plus className="size-4 mr-2" />Adicionar produto</Button>
        </div>
      ) : (
        <div className="rounded-xl overflow-x-auto border border-wolf-blue/15">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-wolf-blue/15 bg-wolf-surface-2">
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Produto</th>
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Categoria</th>
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Preço</th>
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Estoque</th>
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-[family-name:var(--font-rajdhani)] font-bold text-wolf-muted tracking-wider uppercase">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-wolf-blue/10 last:border-0 bg-wolf-surface hover:bg-wolf-surface-2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {p.image_url ? (
                        <img src={p.image_url} className="size-8 rounded-lg object-cover" alt={p.name} />
                      ) : (
                        <div className="size-8 rounded-lg bg-wolf-surface-2 border border-wolf-blue/15 flex items-center justify-center">
                          <Package className="size-4 text-wolf-muted" />
                        </div>
                      )}
                      <div>
                        <p className="font-[family-name:var(--font-rajdhani)] font-semibold text-wolf-white">{p.name}</p>
                        {p.description && <p className="text-xs text-wolf-muted line-clamp-1">{p.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-wolf-muted text-xs">{p.category ?? "—"}</td>
                  <td className="px-4 py-3 font-[family-name:var(--font-rajdhani)] font-bold text-wolf-white">{formatCurrency(p.price * 100)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-[family-name:var(--font-orbitron)] font-bold text-sm", p.stock === 0 ? "text-wolf-red" : p.stock < 5 ? "text-wolf-amber" : "text-emerald-400")}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)}
                      className={cn("text-xs px-2 py-0.5 rounded-full border font-[family-name:var(--font-rajdhani)] font-bold transition-all",
                        p.active ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" : "text-wolf-muted bg-wolf-muted/10 border-wolf-muted/20 hover:bg-wolf-muted/20"
                      )}>
                      {p.active ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-wolf-blue/20 text-wolf-muted hover:text-wolf-blue-light transition-colors">
                        <Edit2 className="size-3.5" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 rounded-lg hover:bg-wolf-red/20 text-wolf-muted hover:text-wolf-red transition-colors">
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-wolf-surface border border-wolf-blue/20 rounded-2xl p-6 w-full max-w-md flex flex-col gap-5 my-4">
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-orbitron)] font-bold text-wolf-white">{editing ? "Editar Produto" : "Novo Produto"}</h2>
              <button onClick={() => setShowCreate(false)} className="text-wolf-muted hover:text-wolf-white"><X className="size-4" /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Nome *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Ex: Red Bull 250ml"
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Preço (R$) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required min={0} step="0.01"
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-wolf-muted">Estoque *</label>
                  <input type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} required min={0}
                    className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Categoria</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none">
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Imagem (URL)</label>
                <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-wolf-muted">Descrição</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-wolf-surface-2 border border-wolf-blue/20 text-wolf-white text-sm focus:outline-none focus:border-wolf-blue/50 resize-none" />
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowCreate(false)}>Cancelar</Button>
                <Button type="submit" className="flex-1" loading={saving}>{editing ? "Salvar" : "Criar"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
