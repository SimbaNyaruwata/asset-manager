import { NextResponse } from "next/server";
import { createUserAction } from "@/lib/user-actions";
import { UserDialog } from '@/components/forms/user-dialog';


export async function POST(req: Request) {
  const body = await req.json();
  const result = await createUserAction(body);
  return NextResponse.json(result);
}
