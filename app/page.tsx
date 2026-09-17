import { Gate } from "@/components/sections/gate";
import { Harness } from "@/components/sections/harness";
import { Hero } from "@/components/sections/hero";
import { InstallStrip } from "@/components/sections/install-strip";
import { OpenModels } from "@/components/sections/open-models";
import { Surfaces } from "@/components/sections/surfaces";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Surfaces />
      <Gate />
      <Harness />
      <OpenModels />
      <InstallStrip />
    </>
  );
}
