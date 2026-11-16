import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { FEATURES, isSuperAdmin } from '@/lib/roles'

export async function DELETE(
  _req: Request,
  { params }:{ params: { userId: string } }
) {
  try {
    const { userId, orgRole } = auth();

    if (!userId || !isSuperAdmin(orgRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!FEATURES.userManagement) {
      return new NextResponse("User management is locked for now.", { status: 403 });
    }
    await clerkClient.users.deleteUser(params.userId);
    
    return NextResponse.json({ message: 'User deleted' })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error deleting user' })
  }
}