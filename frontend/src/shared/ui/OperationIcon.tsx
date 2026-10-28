import type { ComponentType } from 'react';
import type { SvgIconProps } from '@mui/material/SvgIcon';
import HomeOutlined from '@mui/icons-material/HomeOutlined';
import PointOfSaleOutlined from '@mui/icons-material/PointOfSaleOutlined';
import LocalOfferOutlined from '@mui/icons-material/LocalOfferOutlined';
import Inventory2Outlined from '@mui/icons-material/Inventory2Outlined';
import PaymentsOutlined from '@mui/icons-material/PaymentsOutlined';
import PersonOutlineOutlined from '@mui/icons-material/PersonOutlineOutlined';
import Search from '@mui/icons-material/Search';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';
import DeleteOutlineOutlined from '@mui/icons-material/DeleteOutlineOutlined';
import WarningAmber from '@mui/icons-material/WarningAmber';
import BarChart from '@mui/icons-material/BarChart';
import ShoppingCartOutlined from '@mui/icons-material/ShoppingCartOutlined';
import ScheduleOutlined from '@mui/icons-material/ScheduleOutlined';
import AccountBalanceWalletOutlined from '@mui/icons-material/AccountBalanceWalletOutlined';
import ReceiptLongOutlined from '@mui/icons-material/ReceiptLongOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import SwapVert from '@mui/icons-material/SwapVert';
import DnsOutlined from '@mui/icons-material/DnsOutlined';
import ChevronRight from '@mui/icons-material/ChevronRight';
import Check from '@mui/icons-material/Check';
import Close from '@mui/icons-material/Close';
import PrintOutlined from '@mui/icons-material/PrintOutlined';
import ZoomInOutlined from '@mui/icons-material/ZoomInOutlined';
import ManageSearchOutlined from '@mui/icons-material/ManageSearchOutlined';

export type OperationIconName = 'home' | 'pos' | 'product' | 'stock' | 'cash' | 'user' | 'search' | 'plus' | 'minus' | 'trash' | 'warning' | 'chart' | 'cart' | 'clock' | 'wallet' | 'receipt' | 'edit' | 'lock' | 'swap' | 'server' | 'chevron' | 'check' | 'close' | 'print' | 'zoom' | 'audit';

const icons: Record<OperationIconName, ComponentType<SvgIconProps>> = {
  home: HomeOutlined, pos: PointOfSaleOutlined, product: LocalOfferOutlined, stock: Inventory2Outlined, cash: PaymentsOutlined,
  user: PersonOutlineOutlined, search: Search, plus: Add, minus: Remove, trash: DeleteOutlineOutlined, warning: WarningAmber,
  chart: BarChart, cart: ShoppingCartOutlined, clock: ScheduleOutlined, wallet: AccountBalanceWalletOutlined,
  receipt: ReceiptLongOutlined, edit: EditOutlined, lock: LockOutlined, swap: SwapVert, server: DnsOutlined,
  chevron: ChevronRight, check: Check, close: Close, print: PrintOutlined, zoom: ZoomInOutlined,
  audit: ManageSearchOutlined
};

export function OperationIcon({ name, size = 28, ...props }: { name: OperationIconName; size?: number } & Omit<SvgIconProps, 'fontSize'>) {
  const Icon = icons[name];
  return <Icon aria-hidden="true" {...props} sx={{ fontSize: size, ...props.sx }} />;
}
