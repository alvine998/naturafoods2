"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "../../i18n";
import { useStore } from "../../lib/store";
import { isAuthed, getUsers, getCurrentUser, addUser, removeUser, updatePassword } from "../../lib/auth";
import type { AdminUser } from "../../lib/auth";
import AdminShell from "../AdminShell";
import { Field, Input, Modal, TableWrap, Pagination, Toolbar, Empty, PAGE_SIZE } from "../_components";

export default function UsersPage() {
  const router = useRouter();
  const { t } = useLang();
  const a = t.admin;
  const u = a.users as { title: string; addUser: string; username: string; password: string; newPassword: string; create: string; remove: string; changePass: string; you: string; exists: string; lastUser: string; selfDelete: string };
  const s = useStore();
  const [gate, setGate] = useState(false);
  const me = getCurrentUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [nu, setNu] = useState(""); const [np, setNp] = useState(""); const [err, setErr] = useState("");
  const [pwd, setPwd] = useState<Record<string, string>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const refresh = () => setUsers(getUsers());
  useEffect(() => { if (!isAuthed()) router.replace("/admin/login"); else { setGate(true); refresh(); } }, [router]);
  const counts = [s.products.length, s.articles.length, s.edu.length, s.innovation.length, s.jobs.length, s.inquiries.length, 0, 0, 0];
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return users;
    return users.filter((x) => x.username.toLowerCase().includes(n));
  }, [users, q]);
  useEffect(() => setPage(1), [q]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const onCreate = () => {
    setErr(""); if (!nu.trim() || !np) return;
    const ok = addUser(nu, np); if (!ok) { setErr(u.exists); return; }
    setNu(""); setNp(""); setModalOpen(false); refresh();
  };
  const onUpdatePwd = () => {
    if (!editUser) return;
    const v = pwd[editUser]?.trim(); if (!v) return;
    updatePassword(editUser, v); setPwd((p) => ({ ...p, [editUser]: "" })); setEditUser(null); refresh();
  };
  if (!gate) return <div className="min-h-screen bg-white grid place-items-center p-12"><span className="h-8 w-8 animate-pulse rounded-full bg-[#2D4A22]/20" /></div>;
  return (
    <AdminShell counts={counts} labels={a.tabs as unknown as string[]}>
      <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] tracking-[0.2em] text-[#8B6F47]">CMS · {u.title}</p><h1 className="mt-1 text-[22px] font-light text-[#2D4A22]">{u.title}</h1></div><span className="rounded-full border bg-white px-3 py-1 text-[11px] text-[#8B6F47]">Signed in: <b className="text-[#2D4A22]">{me}</b></span></div>
      <div className="mt-4 grid gap-3">
        <Toolbar q={q} setQ={setQ} total={users.length} filtered={filtered.length} onAdd={() => { setNu(""); setNp(""); setErr(""); setModalOpen(true); }} addLabel={u.addUser} />
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={`${u.addUser} — ${u.title}`}>
          <div className="grid gap-3">
            <Field label={u.username}><Input value={nu} onChange={(e) => setNu(e.target.value)} placeholder="newuser" /></Field>
            <Field label={u.password}><Input type="password" value={np} onChange={(e) => setNp(e.target.value)} placeholder="••••••••" /></Field>
            {err && <p className="text-[11px] text-red-600">{err}</p>}
            <div className="flex gap-2"><button onClick={onCreate} disabled={!nu.trim() || !np} className="rounded-full bg-[#2D4A22] px-5 py-2.5 text-[11px] text-white disabled:opacity-50">{u.create}</button><button onClick={() => setModalOpen(false)} className="rounded-full border px-5 py-2.5 text-[11px]">{a.cancel}</button></div>
          </div>
        </Modal>
        <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`${u.changePass} — ${editUser ?? ""}`}>
          <div className="grid gap-3">
            <Field label={u.newPassword}><Input type="password" value={editUser ? (pwd[editUser] ?? "") : ""} onChange={(e) => editUser && setPwd((p) => ({ ...p, [editUser]: e.target.value }))} placeholder="••••••••" /></Field>
            <div className="flex gap-2"><button onClick={onUpdatePwd} className="rounded-full bg-[#2D4A22] px-5 py-2 text-[11px] text-white">{u.changePass}</button><button onClick={() => setEditUser(null)} className="rounded-full border px-5 py-2 text-[11px]">{a.cancel}</button></div>
          </div>
        </Modal>
        {filtered.length === 0 ? <Empty msg={a.noData} /> : (
          <TableWrap>
            <table className="w-full min-w-[520px] text-[12px]">
              <thead className="bg-white text-[10px] tracking-[0.12em] text-[#8B6F47]"><tr><th className="px-3 py-3 text-left font-medium">Username</th><th className="px-3 py-3 text-left font-medium">Status</th><th className="px-3 py-3 text-right font-medium">Actions</th></tr></thead>
              <tbody className="divide-y divide-[#2D4A22]/10">
                {paged.map((usr) => (
                  <tr key={usr.username} className="hover:bg-white/60">
                    <td className="px-3 py-2 font-medium text-[#2D4A22]">{usr.username} {usr.username === me && <span className="ml-1 rounded-full bg-[#2D4A22] px-2 py-0.5 text-[10px] text-white">{u.you}</span>}</td>
                    <td className="px-3 py-2 text-[#8B6F47]">{usr.username === me ? "current" : "active"}</td>
                    <td className="px-3 py-2 text-right"><div className="inline-flex gap-1.5"><button onClick={() => setEditUser(usr.username)} className="rounded-full border bg-white px-3 py-1 text-[11px]">{u.changePass}</button><button onClick={() => { const ok = removeUser(usr.username); if (!ok) { const meSelf = usr.username === me; setErr(meSelf ? u.selfDelete : u.lastUser); setTimeout(() => setErr(""), 2000); return; } refresh(); }} className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[11px] text-red-700">{u.remove}</button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPage={setPage} />
          </TableWrap>
        )}
        {err && <p className="text-[11px] text-red-600">{err}</p>}
      </div>
    </AdminShell>
  );
}
