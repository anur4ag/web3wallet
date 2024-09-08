import Wallet from "@/components/Wallet";

export default function Home() {
  return (
    <div className="h-screen flex flex-col items-center ">
      <div className="pt-4 flex flex-col items-center">
        <h1 className="text-4xl font-bold">Web 3 wallet</h1>
        <Wallet />
      </div>
    </div>
  );
}
