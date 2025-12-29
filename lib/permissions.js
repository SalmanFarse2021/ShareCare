export const PERMISSIONS = {
    // Only Manager can modify inventory
    MANAGE_INVENTORY: ['manager'],

    // Member & Manager can SEE inventory (Volunteers cannot)
    VIEW_INVENTORY: ['manager', 'member'],

    // Member & Manager can approve people trying to join
    APPROVE_JOIN: ['manager', 'member'],

    // Manager is top level admin (can remove people, etc.)
    MANAGE_TEAM: ['manager'],

    VIEW_SENSITIVE: ['manager']
};

export function hasPermission(userRole, requiredRoles) {
    if (!userRole) return false;
    return requiredRoles.includes(userRole);
}
