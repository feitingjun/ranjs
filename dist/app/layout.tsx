import { Outlet } from 'react-router'
import { AliveScope } from 'react-activation'

export default () => {
  return (
    <AliveScope>
      <Outlet />
    </AliveScope>
  )
}