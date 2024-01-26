import NextAuth from "next-auth";
import { NextRequest } from "next/server";

import { authOptions } from "@/utils/authOptions";

export function GET(req: NextRequest, res: any) {
  return NextAuth(req, res, authOptions);
}

export function POST(req: NextRequest, res: any) {
  return NextAuth(req, res, authOptions);
}