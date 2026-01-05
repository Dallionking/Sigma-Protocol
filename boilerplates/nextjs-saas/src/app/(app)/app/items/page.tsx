"use client";

import { useState } from "react";

interface Item {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
}

const initialItems: Item[] = [
  { id: "1", name: "Project Alpha", description: "Main development project", status: "active", createdAt: "2024-01-15" },
  { id: "2", name: "Marketing Campaign", description: "Q1 marketing initiatives", status: "active", createdAt: "2024-01-20" },
  { id: "3", name: "Design System", description: "Component library updates", status: "pending", createdAt: "2024-02-01" },
  { id: "4", name: "Legacy Migration", description: "Database migration project", status: "inactive", createdAt: "2024-02-10" },
];

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", status: "active" as Item["status"] });

  const handleCreate = () => {
    setEditingItem(null);
    setFormData({ name: "", description: "", status: "active" });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({ name: item.name, description: item.description, status: item.status });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setItems(items.map((item) => (item.id === editingItem.id ? { ...item, ...formData } : item)));
    } else {
      const newItem: Item = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setItems([...items, newItem]);
    }
    setIsModalOpen(false);
  };

  const statusColors = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    inactive: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Items</h1>
          <p className="text-slate-400">CRUD example with local state</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Item
        </button>
      </div>

      {/* Table */}
      <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Description</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-slate-400">Created</th>
              <th className="text-right py-4 px-6 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30">
                <td className="py-4 px-6 text-white font-medium">{item.name}</td>
                <td className="py-4 px-6 text-slate-400">{item.description}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusColors[item.status]}`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-slate-400">{item.createdAt}</td>
                <td className="py-4 px-6">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-6">
              {editingItem ? "Edit Item" : "Create Item"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as Item["status"] })}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
                >
                  {editingItem ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

