"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, BarChart2, Settings, Users, ArrowLeft } from 'lucide-react';

export default function PointDashboardLayout({ children, params }) {
    const pathname = usePathname();
    const { id } = params;

    const navItems = [
        { name: 'Overview', href: `/dashboard/my-points/${id}`, icon: LayoutDashboard },
        { name: 'Inventory', href: `/dashboard/my-points/${id}/inventory`, icon: Package },
        { name: 'Analysis', href: `/dashboard/my-points/${id}/analysis`, icon: BarChart2 },
        { name: 'Team', href: `/dashboard/points/${id}/team`, icon: Users }, // Keeping existing team internal route for now
        { name: 'Settings', href: `/dashboard/points/${id}/edit`, icon: Settings },
    ];

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/dashboard/my-points" style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    color: '#6b7280', textDecoration: 'none', marginBottom: '16px', fontWeight: '500'
                }}>
                    <ArrowLeft size={18} /> Back to My Points
                </Link>

                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Point Management</h1>
                <p style={{ color: '#6b7280' }}>Manage your point's operations, inventory, and insights.</p>
            </div>

            {/* Sub Navigation */}
            <div style={{
                display: 'flex', gap: '8px', borderBottom: '1px solid #e5e7eb', marginBottom: '24px',
                overflowX: 'auto', paddingBottom: '2px'
            }}>
                {navItems.map(item => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '12px 16px',
                            borderBottom: isActive ? '2px solid var(--primary-600)' : '2px solid transparent',
                            color: isActive ? 'var(--primary-600)' : '#4b5563',
                            fontWeight: isActive ? '600' : '500',
                            textDecoration: 'none',
                            whiteSpace: 'nowrap'
                        }}>
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    );
                })}
            </div>

            <div style={{ background: 'white', borderRadius: '12px', minHeight: '400px' }}>
                {children}
            </div>
        </div>
    );
}
