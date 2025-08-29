// APP components
import CreatePost from "@/components/create-post";
import Riera from "@/components/riera";

export default function Home() {
  return (
    <div className="font-sans rounded md:p-8">
      <div className="max-w-200 mx-auto">
        <CreatePost />

        <div className="pt:0 pb-20 md:py-20 flex flex-col md:gap-4">
          <Riera />
          <Riera />
          <Riera />
          <Riera />
          <Riera />
        </div>



      </div>
    </div>
  );
}
