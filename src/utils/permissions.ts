import { jwtDecode } from 'jwt-decode';

// JSON Web Token
// {
//   "sub": "user123@weareverise.com",
//   "first_name": "user",
//   "last_name": "123",
//   "division": "EverAI Product",
//   "department": "Product Design dev",
//   "reporting_to": "charlie.white@weareverise.com",
//   "WS-2025-1001": {
//       "roles": {
//           "simulator": ["manager", "trainer"],
//           "qa_coaching": ["coach", "admin"],
//           "knowledge_miner": ["analyst", "manager"]
//       },
//       "permissions": {
//           "simulator": {
//               "training": ["read", "write"],
//               "playback": ["read"],
//               "dashboard_admin": ["read", "write"],
//               "dashboard_trainee": ["read"]
//           },
//           "qa_coaching": {
//               "training": ["read", "write"]
//           },
//           "knowledge_miner": {
//               "miner_module": ["read", "write"]
//           }
//       }
//   },
//   "WS-2025-1002": {
//       "roles": {
//           "simulator": ["manager", "trainer"],
//           "qa_coaching": ["coach", "admin"],
//           "knowledge_miner": ["analyst", "manager"]
//       },
//       "permissions": {
//           "simulator": {
//               "training": ["read", "write"],
//               "playback": ["read"],
//               "dashboard_admin": ["read", "write"],
//               "dashboard_trainee": ["read"]
//           },
//           "qa_coaching": {
//               "training": ["read", "write"]
//           },
//           "knowledge_miner": {
//               "miner_module": ["read", "write"]
//           }
//       }
//   },
//   "iat": 1612435154,  
//   "exp": 1612445154  
// }


interface Permission {
  read?: boolean;
  write?: boolean;
}

interface ModulePermissions {
  [key: string]: string[];
}

interface WorkspacePermissions {
  simulator?: {
    [key: string]: string[];
  };
}

interface TokenData {
  'WS-2025-1001': {
    permissions: {
      simulator?: {
        [key: string]: string[];
      };
    };
  };
}

// Map dashboard routes to their corresponding permission keys
export const MODULE_PERMISSION_MAP = {
  '/dashboard': 'dashboard_trainee',
  '/dashboard-admin': 'dashboard_admin',
  '/dashboard-manager': 'dashboard_admin',
  '/training': 'training',
  '/playback': 'playback',
  '/manage-simulations': 'simulations',
  '/manage-training-plan': 'training_plan',
  '/assign-simulations': 'training',
  '/settings': 'training',
};

export const hasPermission = (path: string): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded: TokenData = jwtDecode(token);
    const workspacePermissions = decoded['WS-2025-1001']?.permissions?.simulator;

    if (!workspacePermissions) return false;

    const requiredPermission = MODULE_PERMISSION_MAP[path];
    if (!requiredPermission) return false; // If no permission mapping exists, don't allow access

    const permissions = workspacePermissions[requiredPermission];
    return permissions?.includes('read') || permissions?.includes('write') || false;
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

export const canWrite = (path: string): boolean => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const decoded: TokenData = jwtDecode(token);
    const workspacePermissions = decoded['WS-2025-1001']?.permissions?.simulator;

    if (!workspacePermissions) return false;

    const requiredPermission = MODULE_PERMISSION_MAP[path];
    if (!requiredPermission) return false;

    const permissions = workspacePermissions[requiredPermission];
    return permissions?.includes('write') || false;
  } catch (error) {
    console.error('Error checking write permissions:', error);
    return false;
  }
}