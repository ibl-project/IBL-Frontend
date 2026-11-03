import { NextRequest, NextResponse } from "next/server";
import lolosStaff from "@/constants/lolos_staff.json";
import tidakLolosStaff from "@/constants/tidak_lolos_staff.json";

// Type definition for the compiled staff details
interface StaffDetail {
  nama: string;
  nrp: string;
  subdivisi: string;
  cp_name: string;
  cp_phone: string;
}

// Type definition for tidak lolos staff (only has nama)
interface TidakLolosDetail {
  nama: string;
}

// Cast imports to their dictionary types
const staffDatabase = lolosStaff as Record<string, StaffDetail>;
const tidakLolosDatabase = tidakLolosStaff as Record<string, TidakLolosDetail>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawNrp = searchParams.get("nrp");

    if (!rawNrp) {
      return NextResponse.json(
        { error: "NRP is required" },
        { status: 400 }
      );
    }

    // Normalize input NRP (remove non-digits)
    const normalizedNrp = rawNrp.trim().replace(/\D/g, "");

    if (!normalizedNrp) {
      return NextResponse.json(
        { error: "Invalid NRP format" },
        { status: 400 }
      );
    }

    // 1. Check if staff passed (lolos)
    const staffMember = staffDatabase[normalizedNrp];

    if (staffMember) {
      return NextResponse.json({
        status: "lolos",
        nama: staffMember.nama,
        subdivisi: staffMember.subdivisi,
        cp_name: staffMember.cp_name,
        cp_phone: staffMember.cp_phone,
      });
    }

    // 2. Check if staff was interviewed but did not pass (tidak lolos)
    const tidakLolosMember = tidakLolosDatabase[normalizedNrp];

    if (tidakLolosMember) {
      return NextResponse.json({
        status: "tidak_lolos",
        nama: tidakLolosMember.nama,
      });
    }

    // 3. NRP not found in any database — not registered
    return NextResponse.json({
      status: "tidak_terdaftar",
      nama: normalizedNrp,
      cp_name: "Arya",
      cp_phone: "6282258425646",
    });
  } catch (error: unknown) {
    console.error("Error in announcement check API:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
