import { isTeacher } from "@/lib/roles";
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation';
import React from 'react'

const AdminLayout = ({
  children
}:{
  children: React.ReactNode;
}) => {
  const { orgRole } = auth();

  if (!isTeacher(orgRole)) {
    return redirect("/")
  }

  return (
    <>{children}</>
  )
}

export default AdminLayout;