import PlaceCard from "@/components/place-card";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { hideNearYouAtom } from "@/utils/jotai";
import { useForegroundPermissions } from "expo-location";
import { Stack } from "expo-router";
import { useAtom } from "jotai/react";
import { FlatList, Linking, View } from "react-native";

export default function ExplorePage() {
  return (
    <View>
      <Stack.Screen options={{ headerShown: true, title: "Explore" }} />
      <Box className="p-4 px-3">
        <NearYou />
      </Box>
    </View>
  );
}

function NearYou() {
  const [locationPermission, requestLocationPermission] =
    useForegroundPermissions();
  const [hideCard, setHideCard] = useAtom(hideNearYouAtom);

  function requestPermissions() {
    if (!locationPermission?.canAskAgain) {
      Linking.openSettings();
    } else {
      requestLocationPermission();
    }
  }

  function dismissCard() {
    setHideCard(true);
  }

  // TODO: Implement Suspense/Skeleton
  if (hideCard || locationPermission === null) return null;
  else {
    return (
      <Box>
        <Heading size="2xl" className="mb-2">
          Near You
        </Heading>
        {locationPermission?.granted ? (
          <NearYouList />
        ) : (
          <Card>
            <Heading size="md" className="mb-1">
              Location Permission Needed
            </Heading>
            <Text size="sm" className="mb-4">
              If you want to quickly access guides for places close to you,
              please allow the app access to your location.
            </Text>
            <Box className="flex-row gap-2">
              <Button onPress={requestPermissions}>
                <ButtonText>
                  {!locationPermission?.canAskAgain
                    ? "Go to Settings"
                    : "Request Permissions"}
                </ButtonText>
              </Button>
              <Button
                variant="outline"
                action="secondary"
                onPress={dismissCard}
              >
                <ButtonText>Dismiss this</ButtonText>
              </Button>
            </Box>
          </Card>
        )}
      </Box>
    );
  }
}

function NearYouList() {
  return null;
}

function LocationList({
  header,
  subheader,
  data,
}: {
  header: string;
  subheader: string;
  data: { id: string; title: string }[];
}) {
  return (
    <Box>
      <Text className="text-2xl">{header}</Text>
      <Text className="text-lg text-gray-500">{subheader}</Text>
      <FlatList
        data={data}
        renderItem={({ item }) => <PlaceCard item={item} key={item.id} />}
      />
    </Box>
  );
}
