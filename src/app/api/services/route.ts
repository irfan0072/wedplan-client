import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthHeader } from '@/lib/server-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category');
    const location = searchParams.get('location')?.toLowerCase() || '';
    const sort = searchParams.get('sort') || 'newest';

    let filtered = store.services.filter(
      (s) => s.status === 'approved' && s.isActive
    );

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(search) ||
          s.description.toLowerCase().includes(search) ||
          s.location.toLowerCase().includes(search)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (location) {
      filtered = filtered.filter((s) => s.location.toLowerCase().includes(location));
    }

    if (sort === 'price_asc' || sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc' || sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      services: filtered,
      total: filtered.length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error fetching services.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const user = verifyAuthHeader(authHeader);

    if (user.role !== 'vendor') {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only vendors can create services.' },
        { status: 403 }
      );
    }

    const { serviceName, category, description, price, location, images } = await req.json();

    if (!serviceName || !category || !description || price === undefined || !location) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields.' },
        { status: 400 }
      );
    }

    // Free plan limitation: maximum 3 active services
    if (user.subscriptionPlan !== 'premium') {
      const activeCount = store.services.filter(
        (s) => (s.vendorId?._id === user._id || s.vendorId?.id === user.id) && s.isActive
      ).length;

      if (activeCount >= 3) {
        return NextResponse.json(
          {
            success: false,
            message: 'Free tier limit reached: Free vendors can publish a maximum of 3 active services. Please upgrade to Premium for unlimited services!',
            limitReached: true,
          },
          { status: 403 }
        );
      }
    }

    const newService = {
      _id: `srv_${Date.now()}`,
      id: `srv_${Date.now()}`,
      vendorId: user,
      serviceName,
      category,
      description,
      price: Number(price),
      location,
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'
      ],
      status: 'pending', // Default status: Pending (until approved by admin)
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    store.services.unshift(newService);

    return NextResponse.json(
      {
        success: true,
        message: 'Service submitted successfully! It is pending admin approval.',
        service: newService,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || 'Error creating service.' },
      { status: 500 }
    );
  }
}
