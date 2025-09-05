import { useState } from 'react';
import { Link } from 'wouter';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    IconButton,
    Chip,
    Paper,
    InputAdornment,
    Autocomplete,
    Tab,
    Tabs,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import {
    Search as SearchIcon,
    LocationOn,
    Work,
    TrendingUp,
    Group,
    Business,
    EmojiEvents,
    Bolt,
    Shield,
    Rocket,
    Code,
    Favorite,
    CheckCircle,
    Schedule,
    AttachMoney,
    Download,
    ChevronRight,
    PlayCircle,
    NotificationsActive,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { styled } from '@mui/material/styles';
import api from '../utils/api';

// Styled components
const SearchContainer = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const StatsCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
    transition: 'transform 0.3s ease',
    '&:hover': {
        transform: 'translateY(-8px)',
    },
}));

const JobCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[8],
    },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
    position: 'relative',
    overflow: 'hidden',
    borderRadius: theme.spacing(2),
    cursor: 'pointer',
    '&:hover img': {
        transform: 'scale(1.1)',
    },
}));

const CategoryImage = styled('img')({
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
});

const HomePage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchQuery, setSearchQuery] = useState('');
    const [location, setLocation] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);

    const { data: jobsData } = useQuery({
        queryKey: ['jobs', 'featured'],
        queryFn: () => api.getJobs({ limit: 6 }).then((res) => res.json()),
    });

    const { data: companiesData } = useQuery({
        queryKey: ['companies', 'featured'],
        queryFn: () => api.getCompanies({ limit: 6 }).then((res) => res.json()),
    });

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchQuery) params.append('search', searchQuery);
        if (location) params.append('location', location);
        window.location.href = `/jobs?${params.toString()}`;
    };

    const popularLocations = [
        'Mumbai',
        'Delhi',
        'Bangalore',
        'Hyderabad',
        'Chennai',
        'Pune',
    ];

    const jobCategories = [
        {
            title: 'Technology',
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
            count: '10,000+',
            color: theme.palette.primary.main,
        },
        {
            title: 'Finance',
            image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c',
            count: '5,000+',
            color: theme.palette.secondary.main,
        },
        {
            title: 'Marketing',
            image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
            count: '3,000+',
            color: '#FF6B6B',
        },
        {
            title: 'Sales',
            image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43',
            count: '4,000+',
            color: '#4ECDC4',
        },
    ];

    return (
        <Box>
            {/* Hero Section */}
            <Box
                sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    pt: { xs: 8, md: 12 },
                    pb: { xs: 12, md: 16 },
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Background Pattern */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: 'url("/patterns/circuit-board.svg")',
                    }}
                />

                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                                    fontWeight: 800,
                                    mb: 2,
                                    position: 'relative',
                                }}
                            >
                                Find Your Dream Job
                                    <Box
                                        component="span"
                                        sx={{
                                            color: theme.palette.secondary.light,
                                            display: 'block',
                                            fontSize: { xs: '1.5rem', md: '2rem' },
                                            mt: 1,
                                        }}
                                    >
                                        100,000+ Jobs • 25,000+ Companies
                                    </Box>
                            </Typography>

                            <Typography variant="h6" sx={{ mb: 4, maxWidth: 600 }}>
                                India's #1 job platform connecting millions of job seekers with top employers
                            </Typography>

                            {/* Search Form */}
                            <SearchContainer elevation={3}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            freeSolo
                                            options={[]}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    placeholder="Job title, keywords, or company"
                                                    variant="outlined"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <SearchIcon color="primary" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            options={popularLocations}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    placeholder="Location"
                                                    variant="outlined"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LocationOn color="primary" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            onClick={handleSearch}
                                            startIcon={<SearchIcon />}
                                        >
                                            Search Jobs
                                        </Button>
                                    </Grid>
                                </Grid>

                                <Box sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                        Popular Searches:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {['Remote Jobs', 'Part Time', 'IT Jobs', 'Fresher'].map((tag) => (
                                            <Chip
                                                key={tag}
                                                label={tag}
                                                variant="outlined"
                                                onClick={() => setSearchQuery(tag)}
                                                sx={{
                                                    color: 'primary.main',
                                                    borderColor: 'primary.main',
                                                    '&:hover': {
                                                        backgroundColor: 'primary.main',
                                                        color: 'white',
                                                    },
                                                }}
                                            />
                                        ))}
                                    </Box>
                                </Box>
                            </SearchContainer>
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1509956072962-7ff0f36dd7ba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwzfHxwZW9wbGUlMjBsYXB0b3BzJTIwb2ZmaWNlJTIwZG9jdW1lbnRzJTIwd29ya3BsYWNlfGVufDB8MHx8Ymx1ZXwxNzU3MDYxODk2fDA&ixlib=rb-4.1.0&q=85"
                                alt="Modern illustration showing people searching for jobs, professional workplace scene with laptops and documents - Christopher Burns on Unsplash"
                                sx={{
                                    width: '100%',
                                    maxWidth: 600,
                                    height: 'auto',
                                    filter: 'drop-shadow(0 0 20px rgba(0,0,0,0.2))',
                                    borderRadius: 2,
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* Quick Stats */}
            <Container maxWidth="lg" sx={{ mt: -8, position: 'relative', zIndex: 1 }}>
                <Grid container spacing={3}>
                    <Grid item xs={6} md={3}>
                        <StatsCard>
                            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold">2M+</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Active Users</Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatsCard>
                            <Business sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold">50K+</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Companies</Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatsCard>
                            <Work sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold">100K+</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Jobs Posted</Typography>
                        </StatsCard>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <StatsCard>
                            <EmojiEvents sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h4" fontWeight="bold">95%</Typography>
                            <Typography variant="subtitle1" color="text.secondary">Success Rate</Typography>
                        </StatsCard>
                    </Grid>
                </Grid>
            </Container>

            {/* Job Categories */}
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                    Popular Job Categories
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
                    Explore opportunities in trending industries
                </Typography>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                    {jobCategories.map((category) => (
                        <Grid item xs={12} sm={6} md={3} key={category.title}>
                            <CategoryCard>
                                <CategoryImage src={category.image} alt={category.title} />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        p: 2,
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                        color: 'white',
                                    }}
                                >
                                    <Typography variant="h6">{category.title}</Typography>
                                    <Typography variant="subtitle2">{category.count} jobs</Typography>
                                </Box>
                            </CategoryCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Featured Jobs */}
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                        Featured Jobs
                    </Typography>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, newValue) => setSelectedTab(newValue)}
                        centered
                        sx={{ mb: 4 }}
                    >
                        <Tab label="All Jobs" />
                        <Tab label="Remote" />
                        <Tab label="Full Time" />
                        <Tab label="Part Time" />
                    </Tabs>
                </Box>

                <Grid container spacing={3}>
                    {jobsData?.jobs?.slice(0, 6).map((job) => (
                        <Grid item xs={12} md={6} lg={4} key={job.id}>
                            <JobCard>
                                <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                            <Avatar
                                                src={job.logo}
                                                variant="rounded"
                                                sx={{ width: 56, height: 56 }}
                                            >
                                                {job.company[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" gutterBottom>
                                                    {job.title}
                                                </Typography>
                                                <Typography variant="subtitle2" color="text.secondary">
                                                    {job.company}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <IconButton>
                                            <Favorite />
                                        </IconButton>
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <Chip
                                            icon={<LocationOn />}
                                            label={job.location}
                                            variant="outlined"
                                            size="small"
                                        />
                                        <Chip
                                            icon={<Schedule />}
                                            label={job.type}
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>

                                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                        {job.skills?.slice(0, 3).map((skill) => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                size="small"
                                                sx={{ bgcolor: 'primary.50' }}
                                            />
                                        ))}
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                                            ₹{job.salary}/month
                                        </Typography>
                                        <Button
                                            component={Link}
                                            href={`/job/${job.id}`}
                                            variant="contained"
                                            endIcon={<ChevronRight />}
                                        >
                                            Apply Now
                                        </Button>
                                    </Box>
                                </CardContent>
                            </JobCard>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button
                        component={Link}
                        href="/jobs"
                        variant="outlined"
                        size="large"
                        endIcon={<ChevronRight />}
                    >
                        View All Jobs
                    </Button>
                </Box>
            </Container>

            {/* Download App Section */}
            <Box
                sx={{
                    bgcolor: 'primary.900',
                    color: 'white',
                    mt: 8,
                    py: 8,
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <Typography variant="h3" gutterBottom fontWeight="bold">
                                Get the FinAutoJobs App
                            </Typography>
                            <Typography variant="h6" paragraph sx={{ color: 'primary.100' }}>
                                Search and apply for jobs on the go. Get instant notifications for your applications.
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<Download />}
                                >
                                    App Store
                                </Button>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="large"
                                    startIcon={<Download />}
                                >
                                    Play Store
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box
                                component="img"
                                src="https://images.unsplash.com/photo-1621691187532-bbeb671757ac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTAwNDR8MHwxfHNlYXJjaHwyfHxtb2JpbGUlMjBwaG9uZSUyMGFwcCUyMGludGVyZmFjZXxlbnwwfDF8fHwxNzU3MDYxODk2fDA&ixlib=rb-4.1.0&q=85"
                                alt="Mobile phone mockup showing job search app interface - Maccy on Unsplash"
                                sx={{
                                    width: '100%',
                                    maxWidth: 400,
                                    height: 'auto',
                                    display: 'block',
                                    margin: '0 auto',
                                }}
                            />
                        </Grid>
                    </Grid>
                </Container>
            </Box>

            {/* New Features Section */}
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                    Explore More Features
                </Typography>
                <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
                    Discover tools and insights to accelerate your career
                </Typography>

                <Grid container spacing={4} sx={{ mt: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                                <Business sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Top Companies
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Explore 25,000+ companies and their culture, benefits, and open positions.
                            </Typography>
                            <Button component={Link} href="/companies" variant="outlined" size="small">
                                Explore Companies
                            </Button>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                                <TrendingUp sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Salary Insights
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Get real-time salary data and trends across Finance and Automotive industries.
                            </Typography>
                            <Button component={Link} href="/salary-insights" variant="outlined" size="small">
                                View Salaries
                            </Button>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                                <EmojiEvents sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Skills Assessment
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Test your skills and showcase your expertise to potential employers.
                            </Typography>
                            <Button component={Link} href="/skills-assessment" variant="outlined" size="small">
                                Take Assessment
                            </Button>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                            <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                                <NotificationsActive sx={{ fontSize: 28 }} />
                            </Avatar>
                            <Typography variant="h6" gutterBottom fontWeight="bold">
                                Job Alerts
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Get notified instantly when jobs matching your criteria are posted.
                            </Typography>
                            <Button component={Link} href="/job-alerts" variant="outlined" size="small">
                                Create Alert
                            </Button>
                        </Card>
                    </Grid>
                </Grid>
            </Container>

            {/* Call to Action */}
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Container maxWidth="md">
                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        Ready to Start Your Career Journey?
                    </Typography>
                    <Typography variant="h6" paragraph color="text.secondary">
                        Join millions of people who've found their dream jobs using FinAutoJobs
                    </Typography>
                    <Box sx={{ mt: 4 }}>
                        <Button
                            component={Link}
                            href="/register"
                            variant="contained"
                            size="large"
                            sx={{ mr: 2 }}
                        >
                            Sign Up Now
                        </Button>
                        <Button
                            component={Link}
                            href="/about"
                            variant="outlined"
                            size="large"
                            startIcon={<PlayCircle />}
                        >
                            Watch How It Works
                        </Button>
                    </Box>
                </Container>
            </Box>
        </Box>
    );
};

export default HomePage;