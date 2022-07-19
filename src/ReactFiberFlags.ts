/**
 * Fiber 结点上的 `真实DOM操作` 标记。
 */

export const NoFlags = /*                      */ 0b00000000000000000000000000;     /**   无DOM操作   */
export const PerformedWork = /*                */ 0b00000000000000000000000001;
export const Placement = /*                    */ 0b00000000000000000000000010;     /**   插入DOM   */
export const Update = /*                       */ 0b00000000000000000000000100;     /**   更新DOM   */
export const PlacementAndUpdate = /*           */ 0b00000000000000000000000110;     /**   移动DOM   */
export const Deletion = /*                     */ 0b00000000000000000000001000;     /**   删除DOM   */
export const ChildDeletion = /*                */ 0b00000000000000000000010000;
export const ContentReset = /*                 */ 0b00000000000000000000100000;
export const Callback = /*                     */ 0b00000000000000000001000000;
export const DidCapture = /*                   */ 0b00000000000000000010000000;
export const ForceClientRender = /*            */ 0b00000000000000000100000000;
export const Ref = /*                          */ 0b00000000000000001000000000;
export const Snapshot = /*                     */ 0b00000000000000010000000000;
export const Passive = /*                      */ 0b00000000000000100000000000;
export const Hydrating = /*                    */ 0b00000000000001000000000000;
export const Visibility = /*                   */ 0b00000000000010000000000000;
export const StoreConsistency = /*             */ 0b00000000000100000000000000;

export type ReactFlags =
  | typeof NoFlags
  | typeof PerformedWork
  | typeof Placement
  | typeof Update
  | typeof PlacementAndUpdate
  | typeof Deletion
  | typeof ChildDeletion
  | typeof ContentReset
  | typeof Callback
  | typeof DidCapture
  | typeof ForceClientRender
  | typeof Ref
  | typeof Snapshot
  | typeof Passive
  | typeof Hydrating
  | typeof Visibility
  | typeof StoreConsistency
  ;