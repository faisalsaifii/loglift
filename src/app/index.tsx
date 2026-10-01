import { Redirect } from 'expo-router';

/**
 * The Muscles tab lives at `/muscles` so it can host its own native header
 * stack. This keeps `/` working as the entry point.
 */
export default function Index() {
  return <Redirect href="/muscles" />;
}
