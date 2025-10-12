import PlaceCard from "@/components/place-card";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Coordinates } from "@/types/geo";
import { handleForegroundError } from "@/utils/errors";
import { hideNearYouAtom } from "@/utils/jotai";
import { trpc } from "@/utils/trpc";
import { skipToken } from "@tanstack/react-query";
import {
  getCurrentPositionAsync,
  getLastKnownPositionAsync,
  LocationAccuracy,
  useForegroundPermissions,
} from "expo-location";
import { Stack, useFocusEffect } from "expo-router";
import { useAtom } from "jotai/react";
import { useCallback, useState } from "react";
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
  const [lngLat, setLngLat] = useState<Coordinates | null>(null);

  const { data } = trpc.getAllResultsForLocation.useQuery(
    lngLat ? { lngLat } : skipToken,
  );

  useFocusEffect(
    useCallback(
      function locate() {
        let freshReceived = false;
        let aborted = false;

        const handleError = handleForegroundError(
          "Your location could not be determined",
        );

        getLastKnownPositionAsync()
          .then((location) => {
            if (aborted || freshReceived || location === null) return;
            const { longitude, latitude } = location.coords;
            setLngLat([longitude, latitude]);
          })
          .catch(handleError);
        getCurrentPositionAsync({ accuracy: LocationAccuracy.Balanced })
          .then((location) => {
            const { longitude, latitude } = location.coords;
            setLngLat([longitude, latitude]);
          })
          .catch(handleError);

        return () => (aborted = true);
      },
      [setLngLat],
    ),
  );

  return <LocationList header="Near You" data={data} />;
}

function LocationList({
  header,
  subheader,
  data,
}: {
  header: string;
  subheader?: string;
  data: { id: string; title: string }[];
}) {
  return (
    <Box>
      <Heading size="2xl">{header}</Heading>
      {subheader && (
        <Heading size="xl" className="text-gray-500">
          {subheader}
        </Heading>
      )}
      <Box className="mt-1">
        {data && (
          <FlatList
            data={data}
            renderItem={({ item }) => <PlaceCard item={item} key={item.id} />}
          />
        )}
      </Box>
    </Box>
  );
}
