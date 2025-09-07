import { useState, useRef } from 'react';
import { useLocation, Link } from 'wouter';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Paper,
    InputBase,
    Popper,
    Grow,
    ClickAwayListener,
    Grid,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Person,
    Work,
    Description,
    School,
    Login,
    Info,
    Phone,
    Gavel,
    Shield,
    Logout,
    Dashboard,
    PostAdd,
    Search as SearchIcon,
    BusinessCenter,
    Code,
    AccountBalance,
    LocalHospital,
    Engineering,
    Store,
    ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [location] = useLocation();
    const { user, logout } = useAuth();
    const [anchorElNav, setAnchorElNav] = useState(null);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [openJobMenu, setOpenJobMenu] = useState(false);
    const jobMenuRef = useRef(null);

    const handleOpenNavMenu = (event) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleDrawerToggle = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const handleJobMenuOpen = () => {
        setOpenJobMenu(true);
    };

    const handleJobMenuClose = () => {
        setOpenJobMenu(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Implement search functionality
            // window.location.href = `/jobs?search=${encodeURIComponent(searchQuery)}`;
        }
    };

    const jobCategories = [
        {
            title: 'Technology',
            icon: <Code />,
            subcategories: ['Software Development', 'Data Science', 'DevOps', 'Cybersecurity']
        },
        {
            title: 'Finance',
            icon: <AccountBalance />,
            subcategories: ['Banking', 'Investment', 'Accounting', 'Insurance']
        },
        {
            title: 'Healthcare',
            icon: <LocalHospital />,
            subcategories: ['Medical', 'Nursing', 'Healthcare Tech', 'Administration']
        },
        {
            title: 'Engineering',
            icon: <Engineering />,
            subcategories: ['Mechanical', 'Electrical', 'Civil', 'Chemical']
        },
        {
            title: 'Business',
            icon: <BusinessCenter />,
            subcategories: ['Marketing', 'Sales', 'HR', 'Operations']
        }
    ];

    const mainMenuItems = [
        {
            label: 'Jobs',
            path: '/jobs',
            icon: <Work />,
            hasMegaMenu: true,
            ref: jobMenuRef,
            onClick: handleJobMenuOpen,
        },
        { label: 'Resume Builder', path: '/resume', icon: <Description /> },
        { label: 'Job Prep', path: '/job-prep', icon: <School /> },
    ];

    const companyMenuItems = [
        { label: 'About Us', path: '/about', icon: <Info /> },
        { label: 'Contact', path: '/contact', icon: <Phone /> },
        { label: 'Terms of Service', path: '/terms-of-service', icon: <Gavel /> },
        { label: 'Privacy Policy', path: '/privacy-policy', icon: <Shield /> },
    ];

    const userMenuItems = user ? [
        { label: 'Dashboard', path: user.role === 'recruiter' ? '/recruiter-dashboard' : '/applicant-dashboard', icon: <Dashboard /> },
        { label: 'Profile', path: '/profile', icon: <Person /> },
        ...(user.role === 'recruiter' ? [{ label: 'Post Job', path: '/add-job', icon: <PostAdd /> }] : []),
        { label: 'Applications', path: '/applications', icon: <Description /> },
    ] : [];

    const drawer = (
        <Box sx={{ width: 280 }} role="presentation">
            {/* Mobile Search */}
            <Box sx={{ p: 2 }}>
                <Paper
                    component="form"
                    onSubmit={handleSearch}
                    sx={{
                        p: '2px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search jobs, companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>
                </Paper>
            </Box>
            <Divider />

            {/* Main Navigation */}
            <List>
                {mainMenuItems.map((item) => (
                    <div key={item.label}>
                        {item.hasMegaMenu ? (
                            <>
                                <ListItem>
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            color: 'primary',
                                            fontWeight: 'medium',
                                        }}
                                    />
                                </ListItem>
                                {jobCategories.map((category) => (
                                    <List key={category.title} component="div" disablePadding>
                                        <ListItem sx={{ pl: 4 }}>
                                            <ListItemIcon>{category.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={category.title}
                                                primaryTypographyProps={{
                                                    variant: 'subtitle2',
                                                    fontWeight: 'medium',
                                                }}
                                            />
                                        </ListItem>
                                        {category.subcategories.map((sub) => (
                                            <ListItem
                                                button
                                                key={sub}
                                                component={Link}
                                                href={`/jobs?category=${encodeURIComponent(sub)}`}
                                                onClick={handleDrawerToggle}
                                                sx={{ pl: 6 }}
                                            >
                                                <ListItemText
                                                    primary={sub}
                                                    primaryTypographyProps={{
                                                        variant: 'body2',
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ))}
                            </>
                        ) : (
                            <ListItem
                                button
                                component={Link}
                                href={item.path}
                                onClick={handleDrawerToggle}
                                selected={location === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.label} />
                            </ListItem>
                        )}
                    </div>
                ))}
            </List>
            <Divider />

            {/* Company Info */}
            <List>
                {companyMenuItems.map((item) => (
                    <ListItem
                        button
                        key={item.label}
                        component={Link}
                        href={item.path}
                        onClick={handleDrawerToggle}
                        selected={location === item.path}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.label} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.paper' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    {/* Logo - Desktop */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mr: 2 }}>
                        <Link href="/">
                            <Box sx={{
                                width: 40,
                                height: 40,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1
                            }}>
                                <Work sx={{ color: 'white', fontSize: 24 }} />
                            </Box>
                        </Link>
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            href="/"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                textDecoration: 'none',
                            }}
                        >
                            FinAutoJobs
                        </Typography>
                    </Box>

                    {/* Mobile menu button */}
                    <Box sx={{ flexGrow: 0, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleDrawerToggle}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                    </Box>

                    {/* Logo - Mobile */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', flexGrow: 1 }}>
                        <Link href="/">
                            <Box sx={{
                                width: 32,
                                height: 32,
                                bgcolor: 'primary.main',
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 1
                            }}>
                                <Work sx={{ color: 'white', fontSize: 20 }} />
                            </Box>
                        </Link>
                        <Typography
                            variant="h6"
                            noWrap
                            component={Link}
                            href="/"
                            sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                textDecoration: 'none',
                            }}
                        >
                            FinAutoJobs
                        </Typography>
                    </Box>

                    {/* Desktop menu */}
                    {/* Desktop menu with search */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, ml: 4, alignItems: 'center', gap: 2 }}>
                        {mainMenuItems.map((item) => (
                            <Box key={item.label}>
                                <Button
                                    ref={item.ref}
                                    component={item.hasMegaMenu ? 'button' : Link}
                                    href={!item.hasMegaMenu ? item.path : undefined}
                                    onClick={item.onClick || handleCloseNavMenu}
                                    sx={{
                                        mx: 1,
                                        color: location === item.path ? 'primary.main' : 'text.primary',
                                        bgcolor: location === item.path ? 'primary.50' : 'transparent',
                                        display: 'flex',
                                        alignItems: 'center',
                                        '&:hover': {
                                            bgcolor: 'primary.50',
                                            color: 'primary.main',
                                        },
                                    }}
                                    endIcon={item.hasMegaMenu ? <ExpandMore /> : null}
                                    startIcon={item.icon}
                                >
                                    {item.label}
                                </Button>
                                {item.hasMegaMenu && (
                                    <Popper
                                        open={openJobMenu}
                                        anchorEl={jobMenuRef.current}
                                        transition
                                        placement="bottom-start"
                                        style={{ zIndex: 1301 }}
                                    >
                                        {({ TransitionProps }) => (
                                            <Grow {...TransitionProps}>
                                                <Paper
                                                    sx={{
                                                        mt: 1,
                                                        width: '100%',
                                                        maxWidth: 900,
                                                        borderRadius: 2,
                                                        boxShadow: 3,
                                                    }}
                                                >
                                                    <ClickAwayListener onClickAway={handleJobMenuClose}>
                                                        <Box sx={{ p: 4 }}>
                                                            <Grid container spacing={4}>
                                                                {jobCategories.map((category) => (
                                                                    <Grid item xs={12} sm={6} md={4} key={category.title}>
                                                                        <Box>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                                                {category.icon}
                                                                                <Typography variant="h6" sx={{ ml: 1 }}>
                                                                                    {category.title}
                                                                                </Typography>
                                                                            </Box>
                                                                            <List dense>
                                                                                {category.subcategories.map((sub) => (
                                                                                    <ListItem
                                                                                        key={sub}
                                                                                        button
                                                                                        component={Link}
                                                                                        href={`/jobs?category=${encodeURIComponent(sub)}`}
                                                                                        onClick={handleJobMenuClose}
                                                                                        sx={{ py: 0.5 }}
                                                                                    >
                                                                                        <ListItemText primary={sub} />
                                                                                    </ListItem>
                                                                                ))}
                                                                            </List>
                                                                        </Box>
                                                                    </Grid>
                                                                ))}
                                                            </Grid>
                                                        </Box>
                                                    </ClickAwayListener>
                                                </Paper>
                                            </Grow>
                                        )}
                                    </Popper>
                                )}
                            </Box>
                        ))}

                        {/* Search Bar */}
                        <Paper
                            component="form"
                            onSubmit={handleSearch}
                            sx={{
                                p: '2px 4px',
                                display: 'flex',
                                alignItems: 'center',
                                width: 400,
                                ml: 'auto',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <InputBase
                                sx={{ ml: 1, flex: 1 }}
                                placeholder="Search jobs, companies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                                <SearchIcon />
                            </IconButton>
                        </Paper>
                    </Box>

                    {/* User menu */}
                    <Box sx={{ flexGrow: 0 }}>
                        {user ? (
                            <>
                                {user.role === 'recruiter' && (
                                    <Button
                                        component={Link}
                                        href="/add-job"
                                        variant="contained"
                                        color="primary"
                                        startIcon={<PostAdd />}
                                        sx={{ mr: 2 }}
                                    >
                                        Post Job
                                    </Button>
                                )}
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar
                                            alt={user.name}
                                            src={user.avatar}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                            }}
                                        >
                                            {user.name?.charAt(0)}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {userMenuItems.map((item) => (
                                        <MenuItem
                                            key={item.label}
                                            component={Link}
                                            href={item.path}
                                            onClick={handleCloseUserMenu}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            {item.icon}
                                            <Typography textAlign="center">{item.label}</Typography>
                                        </MenuItem>
                                    ))}
                                    <MenuItem
                                        onClick={() => {
                                            handleCloseUserMenu();
                                            logout();
                                        }}
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            color: 'error.main',
                                        }}
                                    >
                                        <Logout />
                                        <Typography textAlign="center">Logout</Typography>
                                    </MenuItem>
                                </Menu>
                            </>
                        ) : (
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <Button
                                    component={Link}
                                    href="/login"
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Login />}
                                >
                                    Login
                                </Button>
                                <Button
                                    component={Link}
                                    href="/register"
                                    variant="contained"
                                    color="primary"
                                >
                                    Sign Up
                                </Button>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            {/* Mobile drawer */}
            <Drawer
                anchor="left"
                open={mobileDrawerOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better mobile performance
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
};

export default Navigation;
