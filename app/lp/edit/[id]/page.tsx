"use client";

import { useParams } from "next/navigation";

import Edit from "@/components/pages/lp/edit";

export default function EditPage() {
  const params = useParams();
  const id = params ? (params["id"] as string) : undefined;

  return (
    <div className="bg-[#EFF0F3]">
      <Edit id={id} />
    </div>
  );
}
