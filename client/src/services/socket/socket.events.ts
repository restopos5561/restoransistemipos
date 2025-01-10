export const SOCKET_EVENTS = {
  // Order Events
  ORDER_CREATED: 'order:created',
  ORDER_UPDATED: 'order:updated',
  ORDER_STATUS_CHANGED: 'order:statusChanged',
  ORDER_ITEM_ADDED: 'order:itemAdded',
  ORDER_ITEM_REMOVED: 'order:itemRemoved',
  ORDER_ITEM_UPDATED: 'order:itemUpdated',
  ORDER_DELETED: 'order:deleted',
  
  // Table Events  
  TABLE_STATUS_CHANGED: 'table:statusChanged',
  TABLE_UPDATED: 'table:updated',
  
  // Kitchen Events
  KITCHEN_ORDER_READY: 'kitchen:orderReady',
  KITCHEN_ORDER_PREPARING: 'kitchen:orderPreparing',
  
  // Bar Events
  BAR_ORDER_READY: 'bar:orderReady',
  BAR_ORDER_PREPARING: 'bar:orderPreparing',
  
  // Room Events
  JOIN_ROOM: 'room:join',
  LEAVE_ROOM: 'room:leave'
} as const; 