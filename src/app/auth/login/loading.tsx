// 中文说明：
// 登录页路由级加载组件：使用统一的全屏加载组件，保持体验一致。
import LoadingScreen from "@/components/LoadingScreen";

export default function Loading() {
  return <LoadingScreen text="正在打开登录页..." />;
}
