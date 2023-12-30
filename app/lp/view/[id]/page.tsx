"use client"

import { useParams } from 'next/navigation';

import View from '@/components/pages/lp/view';

export default function ViewPage() {
  const params = useParams();
  const id = params ? (params["id"] as string) : undefined;

  return (
    <div className="">
      <View id={id} />
    </div>
  );
}
