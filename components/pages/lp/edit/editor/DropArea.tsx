import { WebsiteElement } from "@/types/websiteElement";

interface DropAreaProps {
  onDrop: (item: WebsiteElement) => void;
  children: React.ReactNode;
}

export default function DropArea({ onDrop, children }: DropAreaProps) {
  return <div>DropArea</div>;
}
