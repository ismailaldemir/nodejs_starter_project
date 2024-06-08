module.exports = {
    privGroups: [
        {
            id: "USERS",
            name: "User Permissions"
        },
        {
            id: "ROLES",
            name: "Role Permissions"
        },
        {
            id: "CATEGORIES",
            name: "Category Permissions"
        },
        {
            id: "AUDITLOGS",
            name: "AuditLogs Permissions"
        }
    ],

    privileges: [
        {
            key: "user_view",
            name: "User View",
            group: "USERS",
            description: "User view"
        },
        {
            key: "user_add",
            name: "User Add",
            group: "USERS",
            description: "User add"
        },
        {
            key: "user_update",
            name: "User Update",
            group: "USERS",
            description: "User update"
        },
        {
            key: "user_delete",
            name: "User Delete",
            group: "USERS",
            description: "User delete"
        },
        {
            key: "role_view",
            name: "Role View",
            group: "ROLES",
            description: "Role view"
        },
        {
            key: "role_add",
            name: "Role Add",
            group: "ROLES",
            description: "Role add"
        },
        {
            key: "role_update",
            name: "Role Update",
            group: "ROLES",
            description: "Role update"
        },
        {
            key: "role_delete",
            name: "Role Delete",
            group: "ROLES",
            description: "Role delete"
        },
        {
            key: "category_view",
            name: "Category View",
            group: "CATEGORIES",
            description: "Category view"
        },
        {
            key: "category_add",
            name: "Category Add",
            group: "CATEGORIES",
            description: "Category add"
        },
        {
            key: "category_update",
            name: "Category Update",
            group: "CATEGORIES",
            description: "Category update"
        },
        {
            key: "category_delete",
            name: "Category Delete",
            group: "CATEGORIES",
            description: "Category delete"
        },
        {
            key: "dwelling_view",
            name: "Dwelling View",
            group: "DWELLINGS",
            description: "Dwelling view"
        },
        {
            key: "dwelling_add",
            name: "Dwelling Add",
            group: "DWELLINGS",
            description: "Dwelling add"
        },
        {
            key: "dwelling_update",
            name: "Dwelling Update",
            group: "DWELLINGS",
            description: "Dwelling update"
        },
        {
            key: "dwelling_delete",
            name: "Dwelling Delete",
            group: "DWELLINGS",
            description: "Dwelling delete"
        },
        {
            key: "person_view",
            name: "Person View",
            group: "PERSONS",
            description: "Person view"
        },
        {
            key: "person_add",
            name: "Person Add",
            group: "PERSONS",
            description: "Person add"
        },
        {
            key: "person_update",
            name: "Person Update",
            group: "PERSONS",
            description: "Person update"
        },
        {
            key: "person_delete",
            name: "Person Delete",
            group: "PERSONS",
            description: "Person delete"
        },
        {
            key: "association_view",
            name: "Association View",
            group: "ASSOCIATIONS",
            description: "Association view"
        },
        {
            key: "association_add",
            name: "Association Add",
            group: "ASSOCIATIONS",
            description: "Association add"
        },
        {
            key: "association_update",
            name: "Association Update",
            group: "ASSOCIATIONS",
            description: "Association update"
        },
        {
            key: "association_delete",
            name: "Association Delete",
            group: "ASSOCIATIONS",
            description: "Association delete"
        },
        {
            key: "category_export",
            name: "Category Export",
            group: "CATEGORIES",
            description: "Category Export"
        },
        {
            key: "auditlogs_view",
            name: "AuditLogs View",
            group: "AUDITLOGS",
            description: "AuditLogs View"
        }
    ]
}