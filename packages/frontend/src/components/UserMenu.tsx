import { Button, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, makeStyles, tokens } from '@fluentui/react-components'
import { PersonRegular, SignOutRegular } from '@fluentui/react-icons'

import { useAppAuth } from '../hooks/useAppAuthContext'

const useStyles = makeStyles({
  userButton: {
    marginLeft: 'auto',
  },
  userName: {
    marginLeft: tokens.spacingHorizontalS,
  },
})

export const UserMenu: React.FunctionComponent = () => {
  const styles = useStyles();
  const { isAuthenticated, displayName, isAdmin, login, logout } = useAppAuth();

  // Nicht angemeldet - Login-Button
  if (!isAuthenticated) {
    return (
      <Button
        appearance="primary"
        onClick={login}
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
            {displayName || 'Benutzer'}
            {isAdmin && ' (Admin)'}
          </span>
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuList>
          <MenuItem icon={<SignOutRegular />} onClick={logout}>
            Abmelden
          </MenuItem>
        </MenuList>
      </MenuPopover>
    </Menu>
  )
}
