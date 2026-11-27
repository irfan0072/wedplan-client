import { NextRequest, NextResponse } from 'next/server';
import { store, verifyAuthRequest, handleApiError } from '@/lib/server-store';
import { isMongoConfigured, connectMongo, ServiceModel, serializeDoc, mongoJson } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const category = searchParams.get('category');
    const location = searchParams.get('location')?.trim() || '';
    const sort = searchParams.get('sort') || 'newest';

    if (isMongoConfigured()) {
      await connectMongo();
      const query: any = { status: 'approved', isActive: true };
      if (search) {
        const rx = new RegExp(search, 'i');
        query.$or = [{ serviceName: rx }, { description: rx }, { location: rx }];
      }
      if (category && category !== 'All') {
        query.category = category;
      }
      if (location) {
        query.location = new RegExp(location, 'i');
      }

      let sortObj: any = { createdAt: -1 };
      if (sort === 'price_asc' || sort === 'price-asc') {
        sortObj = { price: 1 };
      } else if (sort === 'price_desc' || sort === 'price-desc') {
        sortObj = { price: -1 };
      }

      const docs = await ServiceModel.find(query)
        .populate('vendorId', 'name businessName image email phone subscriptionPlan')
        .sort(sortObj);

      const services = docs.map(serializeDoc);
      return mongoJson({ success: true, services, total: services.length });
    }

    const searchLower = search.toLowerCase();
    const locationLower = location.toLowerCase();

    let filtered = store.services.filter(
      (s) => s.status === 'approved' && s.isActive
    );

    if (searchLower) {
      filtered = filtered.filter(
        (s) =>
          s.serviceName.toLowerCase().includes(searchLower) ||
          s.description.toLowerCase().includes(searchLower) ||
          s.location.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'All') {
      filtered = filtered.filter((s) => s.category === category);
    }

    if (locationLower) {
      filtered = filtered.filter((s) => s.location.toLowerCase().includes(locationLower));
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
    const user = await verifyAuthRequest(authHeader);

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

    const defaultImgs =
      Array.isArray(images) && images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80'];

    if (isMongoConfigured()) {
      await connectMongo();
      if (user.subscriptionPlan !== 'premium') {
        const activeCount = await ServiceModel.countDocuments({
          vendorId: user._id,
          isActive: true,
        });
        if (activeCount >= 3) {
          return mongoJson(
            {
              success: false,
              message:
                'Free tier limit reached: Free vendors can publish a maximum of 3 active services. Please upgrade to Premium for unlimited services!',
              limitReached: true,
            },
            403
          );
        }
      }

      const created = await ServiceModel.create({
        vendorId: user._id,
        serviceName,
        category,
        description,
        price: Number(price),
        location,
        images: defaultImgs,
        status: 'pending',
        isActive: true,
      });

      const populated = await created.populate(
        'vendorId',
        'name businessName image email phone subscriptionPlan'
      );

      return mongoJson(
        {
          success: true,
          message: 'Service submitted successfully! It is pending admin approval.',
          service: serializeDoc(populated),
        },
        201
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
            message:
              'Free tier limit reached: Free vendors can publish a maximum of 3 active services. Please upgrade to Premium for unlimited services!',
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
      images: defaultImgs,
      status: 'pending',
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
    const { status, body } = handleApiError(err);
    return NextResponse.json(body, { status });
  }
}
