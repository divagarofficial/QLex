"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  GraduationCap,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CheckCircle2,
  XCircle,
  IndianRupee,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ArrowRight,
  UserCheck,
  UserX,
} from "lucide-react";
import { StudentItem } from "@/services/adminStudents";

interface StudentCardProps {
  student: StudentItem;
  onToggleStatusClick: (student: StudentItem) => void;
}

export default function StudentCard({ student, onToggleStatusClick }: StudentCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const formattedDate = student.created_at
    ? new Date(student.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between ${
        student.is_active
          ? "bg-gradient-to-b from-slate-900/90 via-slate-900/80 to-slate-950/90 border-slate-800/80 hover:border-cyan-500/40 shadow-xl hover:shadow-cyan-500/10"
          : "bg-slate-950/80 border-red-500/20 opacity-85 hover:opacity-100"
      }`}
    >
      {/* Active Token Banner if any */}
      {student.current_active_token && (
        <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500/20 via-amber-500/30 to-amber-500/20 border-b border-amber-500/30 py-1 px-4 flex items-center justify-between text-[11px] font-semibold text-amber-300">
          <div className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Active Token: {student.current_active_token}</span>
          </div>
          <span className="uppercase tracking-wider text-[10px] bg-amber-500/30 px-2 py-0.5 rounded text-amber-200">
            {student.current_order_status}
          </span>
        </div>
      )}

      <div className={student.current_active_token ? "mt-5" : ""}>
        {/* Card Header: Avatar & Info */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-sm border shadow-inner ${
                student.is_active
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-600/30 text-cyan-300 border-cyan-500/30"
                  : "bg-red-950/40 text-red-400 border-red-500/30"
              }`}
            >
              {getInitials(student.full_name)}
            </div>

            <div>
              <h3 className="font-bold text-white text-base leading-tight group-hover:text-cyan-300 transition-colors">
                {student.full_name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 border border-slate-700">
                  {student.register_number}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Year {student.year_number} - {student.section_name}
                </span>
              </div>
            </div>
          </div>

          {/* Account Status Badge */}
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
              student.is_active
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {student.is_active ? (
              <>
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Active
              </>
            ) : (
              <>
                <ShieldAlert className="w-3 h-3 text-red-400" /> Blocked
              </>
            )}
          </span>
        </div>

        {/* Department & Contact Info */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-slate-400">
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate font-medium">{student.department_name}</span>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
              <span className="font-mono">{student.phone}</span>
            </div>
            {student.email && (
              <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[150px]">
                <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="truncate">{student.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Activity & Revenue Statistics */}
        <div className="grid grid-cols-4 gap-2 my-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 text-center font-mono">
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Orders</div>
            <div className="text-sm font-bold text-white mt-0.5">{student.total_orders}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Done</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">{student.completed_orders}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Cancelled</div>
            <div className="text-sm font-bold text-red-400 mt-0.5">{student.cancelled_orders}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Spent</div>
            <div className="text-sm font-bold text-cyan-300 mt-0.5">₹{student.total_spent.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>Joined {formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Account Status Toggle Button */}
          <button
            onClick={() => onToggleStatusClick(student)}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
              student.is_active
                ? "bg-red-950/30 hover:bg-red-900/50 border-red-500/30 text-red-400 hover:text-red-300"
                : "bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-500/30 text-emerald-400 hover:text-emerald-300"
            }`}
            title={student.is_active ? "Disable Student Account" : "Enable Student Account"}
          >
            {student.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </button>

          {/* View Profile Button */}
          <Link
            href={`/admin/students/${student.id}`}
            className="flex items-center gap-1.5 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition-all group"
          >
            <span>Profile</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
