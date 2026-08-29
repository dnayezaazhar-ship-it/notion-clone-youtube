import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

async function DocLayout({
children,
params,
}: {
children: React.ReactNode;
params: Promise<{ id: string }>;
}) {
const { userId } = await auth();

if (!userId) {
return null;
}

const { id } = await params;

return(<RoomProvider roomId={id}>{children}</RoomProvider>)

}

export default DocLayout;
