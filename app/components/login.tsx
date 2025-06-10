import { CircleArrowRight } from "lucide-react-native";
import { Box } from "./ui/box";
import { Button, ButtonText } from "./ui/button";
import { Center } from "./ui/center";
import { Heading } from "./ui/heading";
import { Input, InputField, InputIcon, InputSlot } from "./ui/input";
import { Text } from "./ui/text";
import { useState } from "react";
import { Link, LinkText } from "./ui/link";
import { HStack } from "./ui/hstack";

export default function Login() {
  const [email, setEmail] = useState("");

  function continueWithGoogle() {}

  function continueWithEmail() {}

  return (
    <Center className="h-full">
      <Box>
        <Heading size="3xl" className="mb-2">
          Sign In
        </Heading>
        <Text className="mb-8">To use this feature, you must be signed in</Text>
        <Button onPress={continueWithGoogle}>
          <ButtonText>Continue with Google</ButtonText>
        </Button>
        <Input className="mt-4">
          <InputField
            placeholder="Continue with Email"
            keyboardType="email-address"
            onSubmitEditing={continueWithEmail}
            onChangeText={setEmail}
          />
          <InputSlot>
            <InputIcon as={CircleArrowRight} />
          </InputSlot>
        </Input>
        <HStack className="mt-2">
          <Text>By continuing, you agree to our </Text>
          <Link href="https://mapvoyage.app">
            <LinkText>privacy policy.</LinkText>
          </Link>
        </HStack>
      </Box>
    </Center>
  );
}
