import { Heading } from "@/components/ui/heading";
import { Card } from "@/components/ui/card";
import { Pressable } from "./ui/pressable";
import { useRouter } from "expo-router";

export type Place = {
  id: string;
  title: string;
};

export default function PlaceCard({ item }: { item: Place }) {
  const router = useRouter();

  function openPlace() {
    router.navigate(`/main/explore/page/${item.id}/map`);
  }

  return (
    <Pressable onPress={openPlace} className="mb -1">
      <Card variant="elevated" size="sm" className="rounded-lg">
        <Heading size="lg">{item.title}</Heading>
      </Card>
    </Pressable>
  );
}
