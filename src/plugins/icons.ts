// 按需导入需要的图标，避免循环依赖
import type { App } from 'vue'

// 只导入实际使用的图标
import {
  Edit,
  Delete,
  Search,
  Plus,
  More,
  DocumentCopy,
  Download,
  Star,
  Box,
  Upload,
  View,
  Setting,
  ArrowLeft,
  ArrowRight,
  Close,
  Check,
  Warning,
  InfoFilled,
  SuccessFilled,
  CircleClose,
  Document,
  Folder,
  FolderOpened,
  Picture,
  Files,
  DataAnalysis,
  Tools,
  Histogram,
  TrendCharts,
  Connection,
  Monitor,
  Cpu,
  Operation,
  Management,
  Switch,
  Platform,
  DataBoard
} from '@element-plus/icons-vue'

export function setupIcons(app: App) {
  // 只注册实际使用的图标
  const icons = {
    Edit,
    Delete,
    Search,
    Plus,
    More,
    DocumentCopy,
    Download,
    Star,
    Box,
    Upload,
    View,
    Setting,
    ArrowLeft,
    ArrowRight,
    Close,
    Check,
    Warning,
    InfoFilled,
    SuccessFilled,
    CircleClose,
    Document,
    Folder,
    FolderOpened,
    Picture,
    Files,
    DataAnalysis,
    Tools,
    Histogram,
    TrendCharts,
    Connection,
    Monitor,
    Cpu,
    Operation,
    Management,
    Switch,
    Platform,
    DataBoard
  }
  
  // 注册图标组件
  for (const [key, component] of Object.entries(icons)) {
    app.component(key, component)
  }
}