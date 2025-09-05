import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Card,
    CardContent,
    Paper,
    InputAdornment,
    Autocomplete,
    Chip,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    Alert,
    Divider,
} from '@mui/material';
import {
    Search as SearchIcon,
    TrendingUp,
    LocationOn,
    Work,
    School,
    Business,
    Timeline,
    CompareArrows,
    Assessment,
    MonetizationOn,
    BarChart,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const SalaryCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[8],
    },
}));

const SalaryInsightsPage = () => {
    const [selectedTab, setSelectedTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedExperience, setSelectedExperience] = useState('');
    const [salaryData, setSalaryData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Mock salary data
    const mockSalaryData = [
        {
            jobTitle: 'Financial Analyst',
            category: 'Finance',
            minSalary: 600000,
            maxSalary: 1200000,
            averageSalary: 900000,
            location: 'Mumbai',
            experience: '2-4 years',
            companies: ['HDFC Bank', 'ICICI Bank', 'Axis Bank'],
            growth: 12,
            demand: 'High',
            skills: ['Excel', 'Financial Modeling', 'SQL', 'Python'],
            jobCount: 1250,
        },
        {
            jobTitle: 'Investment Banking Analyst',
            category: 'Finance',
            minSalary: 1200000,
            maxSalary: 2500000,
            averageSalary: 1850000,
            location: 'Mumbai',
            experience: '1-3 years',
            companies: ['Goldman Sachs', 'JP Morgan', 'Morgan Stanley'],
            growth: 18,
            demand: 'Very High',
            skills: ['Financial Modeling', 'Valuation', 'Excel', 'PowerPoint'],
            jobCount: 450,
        },
        {
            jobTitle: 'Automotive Engineer',
            category: 'Automotive',
            minSalary: 500000,
            maxSalary: 1500000,
            averageSalary: 1000000,
            location: 'Pune',
            experience: '3-6 years',
            companies: ['Tata Motors', 'Mahindra', 'Bajaj Auto'],
            growth: 8,
            demand: 'Medium',
            skills: ['CAD', 'CATIA', 'Automotive Systems', 'Testing'],
            jobCount: 890,
        },
        {
            jobTitle: 'Risk Manager',
            category: 'Finance',
            minSalary: 1000000,
            maxSalary: 2200000,
            averageSalary: 1600000,
            location: 'Mumbai',
            experience: '5-8 years',
            companies: ['HDFC Bank', 'SBI', 'ICICI Bank'],
            growth: 15,
            demand: 'High',
            skills: ['Risk Assessment', 'Compliance', 'Analytics', 'Regulations'],
            jobCount: 320,
        },
        {
            jobTitle: 'Electric Vehicle Engineer',
            category: 'Automotive',
            minSalary: 800000,
            maxSalary: 1800000,
            averageSalary: 1300000,
            location: 'Bangalore',
            experience: '2-5 years',
            companies: ['Ola Electric', 'Ather Energy', 'TVS Motor'],
            growth: 25,
            demand: 'Very High',
            skills: ['Battery Technology', 'Electric Motors', 'Power Electronics'],
            jobCount: 560,
        },
        {
            jobTitle: 'Portfolio Manager',
            category: 'Finance',
            minSalary: 1500000,
            maxSalary: 3500000,
            averageSalary: 2500000,
            location: 'Mumbai',
            experience: '6-10 years',
            companies: ['Mutual Funds', 'Asset Management', 'Private Equity'],
            growth: 20,
            demand: 'High',
            skills: ['Portfolio Management', 'Investment Analysis', 'Risk Management'],
            jobCount: 180,
        },
    ];

    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad'];
    const experienceLevels = ['0-2 years', '2-4 years', '4-6 years', '6-10 years', '10+ years'];

    useEffect(() => {
        setSalaryData(mockSalaryData);
    }, []);

    const formatSalary = (amount) => {
        if (amount >= 10000000) {
            return `₹${(amount / 10000000).toFixed(1)}Cr`;
        } else if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        } else {
            return `₹${(amount / 1000).toFixed(0)}K`;
        }
    };

    const filteredSalaryData = salaryData.filter(item => {
        const matchesSearch = item.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !selectedLocation || item.location === selectedLocation;
        const matchesExperience = !selectedExperience || item.experience === selectedExperience;
        
        if (selectedTab === 0) return matchesSearch && matchesLocation && matchesExperience; // All
        if (selectedTab === 1) return matchesSearch && matchesLocation && matchesExperience && item.category === 'Finance';
        if (selectedTab === 2) return matchesSearch && matchesLocation && matchesExperience && item.category === 'Automotive';
        
        return matchesSearch && matchesLocation && matchesExperience;
    });

    const getDemandColor = (demand) => {
        switch (demand) {
            case 'Very High': return 'error';
            case 'High': return 'warning';
            case 'Medium': return 'info';
            case 'Low': return 'success';
            default: return 'primary';
        }
    };

    const SalaryCardComponent = ({ data }) => (
        <SalaryCard>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {data.jobTitle}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data.category}
                        </Typography>
                    </Box>
                    <Chip
                        label={data.demand}
                        color={getDemandColor(data.demand)}
                        size="small"
                    />
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" color="primary" fontWeight="bold" gutterBottom>
                        {formatSalary(data.averageSalary)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Average Salary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Range: {formatSalary(data.minSalary)} - {formatSalary(data.maxSalary)}
                    </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {data.location}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {data.experience}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Top Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {data.skills.slice(0, 3).map((skill, index) => (
                            <Chip
                                key={index}
                                label={skill}
                                size="small"
                                variant="outlined"
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        Salary Growth: +{data.growth}% this year
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={data.growth * 5}
                        color={data.growth > 15 ? 'success' : data.growth > 10 ? 'warning' : 'primary'}
                        sx={{ height: 6, borderRadius: 3 }}
                    />
                </Box>

                <Typography variant="body2" color="text.secondary">
                    {data.jobCount} jobs available
                </Typography>
            </CardContent>
        </SalaryCard>
    );

    const SalaryComparisonTable = () => (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Job Title</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Experience</TableCell>
                        <TableCell align="right">Min Salary</TableCell>
                        <TableCell align="right">Max Salary</TableCell>
                        <TableCell align="right">Average</TableCell>
                        <TableCell align="center">Growth</TableCell>
                        <TableCell align="center">Demand</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {filteredSalaryData.map((row, index) => (
                        <TableRow key={index} hover>
                            <TableCell>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    {row.jobTitle}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {row.category}
                                </Typography>
                            </TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{row.experience}</TableCell>
                            <TableCell align="right">{formatSalary(row.minSalary)}</TableCell>
                            <TableCell align="right">{formatSalary(row.maxSalary)}</TableCell>
                            <TableCell align="right">
                                <Typography variant="subtitle2" color="primary" fontWeight="bold">
                                    {formatSalary(row.averageSalary)}
                                </Typography>
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={`+${row.growth}%`}
                                    color={row.growth > 15 ? 'success' : row.growth > 10 ? 'warning' : 'primary'}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell align="center">
                                <Chip
                                    label={row.demand}
                                    color={getDemandColor(row.demand)}
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const SalaryTrends = () => {
        const trendData = [
            { year: '2020', finance: 850000, automotive: 750000 },
            { year: '2021', finance: 920000, automotive: 800000 },
            { year: '2022', finance: 1050000, automotive: 900000 },
            { year: '2023', finance: 1200000, automotive: 1000000 },
            { year: '2024', finance: 1350000, automotive: 1150000 },
        ];

        return (
            <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Salary Trends (2020-2024)
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="primary" gutterBottom>
                            Finance Sector
                        </Typography>
                        {trendData.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">{item.year}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {formatSalary(item.finance)}
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" color="secondary" gutterBottom>
                            Automotive Sector
                        </Typography>
                        {trendData.map((item, index) => (
                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">{item.year}</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                    {formatSalary(item.automotive)}
                                </Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </Paper>
        );
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
                    Salary Insights
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Discover salary trends and compensation data across Finance and Automotive industries
                </Typography>
            </Box>

            {/* Search and Filters */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            placeholder="Search job titles or categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={locations}
                            value={selectedLocation}
                            onChange={(event, newValue) => setSelectedLocation(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select location"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOn />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Autocomplete
                            options={experienceLevels}
                            value={selectedExperience}
                            onChange={(event, newValue) => setSelectedExperience(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select experience"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Work />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Category Tabs */}
            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={selectedTab}
                    onChange={(e, newValue) => setSelectedTab(newValue)}
                    centered
                >
                    <Tab label="All Industries" />
                    <Tab label="Finance & Banking" />
                    <Tab label="Automotive" />
                </Tabs>
            </Box>

            {/* Key Insights */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <MonetizationOn sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold" color="primary">
                            {formatSalary(filteredSalaryData.reduce((sum, item) => sum + item.averageSalary, 0) / filteredSalaryData.length || 0)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average Salary
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold" color="success.main">
                            +{Math.round(filteredSalaryData.reduce((sum, item) => sum + item.growth, 0) / filteredSalaryData.length || 0)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Average Growth
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <Assessment sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold" color="warning.main">
                            {filteredSalaryData.filter(item => item.demand === 'Very High' || item.demand === 'High').length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            High Demand Roles
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, textAlign: 'center' }}>
                        <BarChart sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                        <Typography variant="h5" fontWeight="bold" color="info.main">
                            {filteredSalaryData.reduce((sum, item) => sum + item.jobCount, 0).toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Total Jobs
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Salary Cards */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Salary Breakdown by Role
            </Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {filteredSalaryData.map((data, index) => (
                    <Grid item xs={12} md={6} lg={4} key={index}>
                        <SalaryCardComponent data={data} />
                    </Grid>
                ))}
            </Grid>

            {/* Salary Comparison Table */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Detailed Salary Comparison
            </Typography>
            <Box sx={{ mb: 4 }}>
                <SalaryComparisonTable />
            </Box>

            {/* Salary Trends */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Industry Salary Trends
            </Typography>
            <SalaryTrends />

            {/* Tips and Insights */}
            <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Salary Negotiation Tips
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Research Market Rates
                            </Typography>
                            <Typography variant="body2">
                                Use this data to understand your market value and negotiate confidently.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Highlight In-Demand Skills
                            </Typography>
                            <Typography variant="body2">
                                Focus on developing skills that are in high demand in your industry.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Consider Total Compensation
                            </Typography>
                            <Typography variant="body2">
                                Look beyond base salary - consider benefits, bonuses, and growth opportunities.
                            </Typography>
                        </Alert>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Alert severity="error" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Location Matters
                            </Typography>
                            <Typography variant="body2">
                                Salary ranges vary significantly by location. Factor in cost of living.
                            </Typography>
                        </Alert>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default SalaryInsightsPage;