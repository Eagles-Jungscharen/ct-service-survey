import { Button, Menu, MenuTrigger, MenuPopover, MenuList, MenuItem, makeStyles, tokens } from '@fluentui/react-components'
import { PersonRegular, SignOutRegular } from '@fluentui/react-icons'
import { useAuth } from 'react-oidc-context'
import { useUserInfo } from '../contexts/AuthContext'

const useStyles = makeStyles({
  userButton: {
    marginLeft: 'auto',
  },
  userName: {
    marginLeft: tokens.spacingHorizontalS,
  },
})

export function UserMenu() {
  const styles = useStyles()
  const auth = useAuth()
  const userInfo = useUserInfo()

  // Nicht angemeldet - Login-Button
  if (!auth.isAuthenticated) {
    return (
      <Button
        appearance="primary"
        onClick={() => auth.signinRedirect()}
        className={styles.userButton}
      >
        Anmelden
      </Button>
    )
  }

  // Angemeldet - User-Menu
  return (
    <Menu>
      <MenuTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<PersonRegular />}
          className={styles.userButton}
        >
          <span className={styles.userName}>
            {userInfo?.displayName || 'Benutzer'}
            {userInfo?.isAdmin && ' (Admin)'}
          </span>
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<SignOutRegular />} onClick={() => auth.signoutRedirect()}>
            Abmelden
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
