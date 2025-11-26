import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
    Container,
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Paper,
    IconButton,
    Tooltip,
    Rating,
    Tabs,
    Tab,
    CircularProgress,
    useTheme,
    useMediaQuery,
    FormControl,
    Select,
    MenuItem,
    Autocomplete,
    TextField,
} from '@mui/material';
import {
    LocationOn,
    Work,
    TrendingUp,
    Group,
    Business,
    Star,
    Favorite,
    FavoriteBorder,
    Language,
    Phone,
    Email,
    FilterList,
    Sort,
    ViewList,
    ViewModule,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import SearchInput from '../components/common/SearchInput';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
    },
}));

const CompanyLogo = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(2),
}));

const CompaniesPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState(0);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState(new Set());
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    
    // Filter states
    const [selectedLocation, setSelectedLocation] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [selectedCompanySize, setSelectedCompanySize] = useState('');
    const [selectedCompanyType, setSelectedCompanyType] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [sortBy, setSortBy] = useState(''); // 'name', 'rating', 'jobs', 'employees'
    
    // Filter options
    const locations = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai', 'Hyderabad', 'Gurugram', 'Kolkata', 'Ahmedabad', 'Noida'];
    const industries = ['Banking & Finance', 'Automotive', 'Investment Banking', 'IT Services', 'Manufacturing', 'E-commerce', 'Consulting'];
    const companySizes = ['1-50', '51-200', '201-500', '501-1000', '1000-5000', '5000-10000', '10000+'];
    const companyTypes = ['MNC', 'Startup', 'Corporate', 'Government', 'Non-profit'];
    const ratingOptions = ['4.5+', '4.0+', '3.5+', '3.0+', 'All Ratings'];

    // Mock companies data with focus on Finance and Automotive
    const mockCompanies = [
        {
            id: 1,
            name: 'Goldman Sachs',
            logo: 'GS',
            industry: 'Investment Banking',
            location: 'Mumbai, India',
            employees: '10,000+',
            rating: 4.5,
            reviews: 2847,
            openJobs: 45,
            description: 'Leading global investment banking, securities and investment management firm.',
            website: 'https://goldmansachs.com',
            founded: 1869,
            specialties: ['Investment Banking', 'Asset Management', 'Securities'],
            benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Learning Budget'],
            culture: 'Fast-paced, collaborative, results-driven environment with focus on excellence.',
            salaryRange: '₹15L - ₹50L',
            featured: true,
        },
        {
            id: 2,
            name: 'Tata Motors',
            logo: 'TM',
            industry: 'Automotive',
            location: 'Pune, India',
            employees: '50,000+',
            rating: 4.2,
            reviews: 1523,
            openJobs: 78,
            description: 'India\'s largest automobile manufacturer and part of the Tata Group.',
            website: 'https://tatamotors.com',
            founded: 1945,
            specialties: ['Electric Vehicles', 'Commercial Vehicles', 'Passenger Cars'],
            benefits: ['Medical Coverage', 'Provident Fund', 'Transport', 'Canteen'],
            culture: 'Innovation-driven culture with strong emphasis on sustainability and quality.',
            salaryRange: '₹8L - ₹25L',
            featured: true,
        },
        {
            id: 3,
            name: 'ICICI Bank',
            logo: 'IB',
            industry: 'Banking & Finance',
            location: 'Mumbai, India',
            employees: '100,000+',
            rating: 4.3,
            reviews: 3421,
            openJobs: 156,
            description: 'Leading private sector bank in India offering comprehensive financial services.',
            website: 'https://icicibank.com',
            founded: 1994,
            specialties: ['Retail Banking', 'Corporate Banking', 'Digital Banking'],
            benefits: ['Health Insurance', 'Performance Bonus', 'Training Programs', 'Career Growth'],
            culture: 'Customer-centric approach with focus on digital innovation and employee development.',
            salaryRange: '₹6L - ₹30L',
            featured: false,
        },
        {
            id: 4,
            name: 'Mahindra & Mahindra',
            logo: 'MM',
            industry: 'Automotive',
            location: 'Mumbai, India',
            employees: '25,000+',
            rating: 4.1,
            reviews: 987,
            openJobs: 92,
            description: 'Leading Indian multinational automotive manufacturing corporation.',
            website: 'https://mahindra.com',
            founded: 1945,
            specialties: ['SUVs', 'Tractors', 'Electric Vehicles', 'Aerospace'],
            benefits: ['Medical Insurance', 'Employee Discounts', 'Skill Development', 'Wellness Programs'],
            culture: 'Entrepreneurial spirit with focus on innovation and sustainable mobility solutions.',
            salaryRange: '₹7L - ₹22L',
            featured: false,
        },
        {
            id: 5,
            name: 'HDFC Bank',
            logo: 'HD',
            industry: 'Banking & Finance',
            location: 'Mumbai, India',
            employees: '120,000+',
            rating: 4.4,
            reviews: 4156,
            openJobs: 203,
            description: 'India\'s largest private sector bank by assets and market capitalization.',
            website: 'https://hdfcbank.com',
            founded: 1994,
            specialties: ['Retail Banking', 'Wholesale Banking', 'Digital Banking'],
            benefits: ['Comprehensive Health Coverage', 'Performance Incentives', 'Learning & Development'],
            culture: 'Performance-driven culture with strong focus on customer service and innovation.',
            salaryRange: '₹5L - ₹35L',
            featured: true,
        },
        {
            id: 6,
            name: 'Maruti Suzuki',
            logo: 'MS',
            industry: 'Automotive',
            location: 'Gurugram, India',
            employees: '15,000+',
            rating: 4.0,
            reviews: 756,
            openJobs: 67,
            description: 'India\'s leading passenger car manufacturer with largest market share.',
            website: 'https://marutisuzuki.com',
            founded: 1981,
            specialties: ['Passenger Cars', 'Manufacturing', 'After Sales Service'],
            benefits: ['Medical Benefits', 'Transport Facility', 'Canteen', 'Recreation Club'],
            culture: 'Quality-focused culture with emphasis on continuous improvement and teamwork.',
            salaryRange: '₹6L - ₹20L',
            featured: false,
        },
    ];

    useEffect(() => {
        // Simulate API call
        setTimeout(() => {
            setCompanies(mockCompanies);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search logic
        console.log('Searching for:', searchQuery);
    };

    const toggleFavorite = (companyId) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (newFavorites.has(companyId)) {
                newFavorites.delete(companyId);
            } else {
                newFavorites.add(companyId);
            }
            return newFavorites;
        });
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            company.industry.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLocation = !selectedLocation || company.location.includes(selectedLocation);
        const matchesIndustry = !selectedIndustry || company.industry.includes(selectedIndustry);
        
        // Company Size Filter
        let matchesCompanySize = true;
        if (selectedCompanySize) {
            const employeeCount = parseInt(company.employees.replace(/[^0-9]/g, ''));
            const [min, max] = selectedCompanySize.includes('+') 
                ? [parseInt(selectedCompanySize.replace('+', '')), Infinity]
                : selectedCompanySize.split('-').map(n => parseInt(n));
            matchesCompanySize = employeeCount >= min && employeeCount <= max;
        }
        
        // Rating Filter
        let matchesRating = true;
        if (selectedRating && selectedRating !== 'All Ratings') {
            const minRating = parseFloat(selectedRating.replace('+', ''));
            matchesRating = company.rating >= minRating;
        }
        
        // Company Type Filter (basic - would need to add companyType to mock data)
        const matchesCompanyType = !selectedCompanyType;
        
        // Apply all filters
        const matchesAllFilters = matchesSearch && matchesLocation && matchesIndustry && 
            matchesCompanySize && matchesRating && matchesCompanyType;
        
        // Apply category tab filter
        if (selectedTab === 0) return matchesAllFilters; // All
        if (selectedTab === 1) return matchesAllFilters && (company.industry.includes('Banking') || company.industry.includes('Finance')); // Finance
        if (selectedTab === 2) return matchesAllFilters && company.industry.includes('Automotive'); // Automotive
        if (selectedTab === 3) return matchesAllFilters && company.featured; // Featured
        
        return matchesAllFilters;
    });
    
    // Sort companies
    const sortedCompanies = [...filteredCompanies].sort((a, b) => {
        if (!sortBy) return 0;
        
        switch (sortBy) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'rating':
                return b.rating - a.rating;
            case 'jobs':
                return b.openJobs - a.openJobs;
            case 'employees':
                const aCount = parseInt(a.employees.replace(/[^0-9]/g, ''));
                const bCount = parseInt(b.employees.replace(/[^0-9]/g, ''));
                return bCount - aCount;
            case 'reviews':
                return b.reviews - a.reviews;
            default:
                return 0;
        }
    });

    const CompanyCard = ({ company }) => (
        <StyledCard>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CompanyLogo sx={{ bgcolor: 'primary.main', color: 'white' }}>
                            {company.logo}
                        </CompanyLogo>
                        <Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                {company.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {company.industry}
                            </Typography>
                        </Box>
                    </Box>
                    <Tooltip title={favorites.has(company.id) ? 'Remove from favorites' : 'Add to favorites'}>
                        <IconButton onClick={() => toggleFavorite(company.id)} color="primary">
                            {favorites.has(company.id) ? <Favorite /> : <FavoriteBorder />}
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Rating and Reviews */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating value={company.rating} precision={0.1} size="small" readOnly />
                    <Typography variant="body2" color="text.secondary">
                        {company.rating} ({company.reviews.toLocaleString()} reviews)
                    </Typography>
                </Box>

                {/* Company Info */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {company.location}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {company.employees} employees
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {company.openJobs} open positions
                        </Typography>
                    </Box>
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                    {company.description}
                </Typography>

                {/* Specialties */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        Specialties:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {company.specialties.slice(0, 3).map((specialty, index) => (
                            <Chip
                                key={index}
                                label={specialty}
                                size="small"
                                variant="outlined"
                                color="primary"
                            />
                        ))}
                        {company.specialties.length > 3 && (
                            <Chip
                                label={`+${company.specialties.length - 3} more`}
                                size="small"
                                variant="outlined"
                            />
                        )}
                    </Box>
                </Box>

                {/* Salary Range */}
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                        Salary Range: {company.salaryRange}
                    </Typography>
                </Box>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                    <Button
                        component="a"
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="contained"
                        fullWidth
                        startIcon={<Language />}
                    >
                        View Company
                    </Button>
                    <Button
                        component={Link}
                        href={`/jobs?company=${company.name}`}
                        variant="outlined"
                        fullWidth
                        startIcon={<Work />}
                    >
                        View Jobs
                    </Button>
                </Box>

                {/* Featured Badge */}
                {company.featured && (
                    <Chip
                        label="Featured"
                        color="secondary"
                        size="small"
                        sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontWeight: 'bold',
                        }}
                    />
                )}
            </CardContent>
        </StyledCard>
    );

    if (loading) {
        return (
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
                <Box sx={{ 
                    width: { xs: 'calc(100% - 32px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                    px: { xs: 2, sm: 3, md: 4 },
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '50vh', 
                    flexDirection: 'column'
                }}>
                    <Typography variant="h4" gutterBottom>Loading companies...</Typography>
                    <CircularProgress color="primary" size={40} sx={{ mt: 2 }} />
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 16px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 1, sm: 3, md: 4 },
                maxWidth: '100vw'
            }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                    Top Companies
                </Typography>
                <Typography variant="h6" color="text.secondary" paragraph>
                    Discover leading companies in Finance and Automotive industries
                </Typography>
            </Box>

            {/* Search Section */}
            <Paper sx={{ p: 3, mb: 4 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        <SearchInput
                            placeholder="Search companies by name or industry..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Content - Sidebar + Companies Layout */}
            <Grid container spacing={3}>
                {/* Left Sidebar - Filters (Always Visible on Desktop) */}
                <Grid item xs={12} md={3}>
                    <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                            <FilterList sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Filters
                        </Typography>

                        {/* Location Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Location
                            </Typography>
                            <Autocomplete
                                options={locations}
                                value={selectedLocation}
                                onChange={(event, newValue) => setSelectedLocation(newValue || '')}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Select location"
                                    />
                                )}
                            />
                        </Box>

                        {/* Industry Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Industry
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedIndustry}
                                    onChange={(e) => setSelectedIndustry(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Industries</MenuItem>
                                    {industries.map((industry) => (
                                        <MenuItem key={industry} value={industry}>{industry}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Company Size Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Company Size
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedCompanySize}
                                    onChange={(e) => setSelectedCompanySize(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Sizes</MenuItem>
                                    {companySizes.map((size) => (
                                        <MenuItem key={size} value={size}>{size} employees</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Company Type Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Company Type
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedCompanyType}
                                    onChange={(e) => setSelectedCompanyType(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Types</MenuItem>
                                    {companyTypes.map((type) => (
                                        <MenuItem key={type} value={type}>{type}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Rating Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Minimum Rating
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedRating}
                                    onChange={(e) => setSelectedRating(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">All Ratings</MenuItem>
                                    {ratingOptions.map((rating) => (
                                        <MenuItem key={rating} value={rating}>{rating}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Sort By Filter */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                <Sort sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                                Sort By
                            </Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    displayEmpty
                                >
                                    <MenuItem value="">Default</MenuItem>
                                    <MenuItem value="name">Name (A-Z)</MenuItem>
                                    <MenuItem value="rating">Highest Rated</MenuItem>
                                    <MenuItem value="jobs">Most Jobs</MenuItem>
                                    <MenuItem value="employees">Company Size</MenuItem>
                                    <MenuItem value="reviews">Most Reviewed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        {/* Category Tabs */}
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                                Category
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {['All Companies', 'Finance', 'Automotive', 'Featured'].map((label, index) => (
                                    <Button
                                        key={label}
                                        variant={selectedTab === index ? 'contained' : 'outlined'}
                                        onClick={() => setSelectedTab(index)}
                                        fullWidth
                                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </Box>
                        </Box>

                        {/* Clear Filters Button */}
                        <Button
                            fullWidth
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedLocation('');
                                setSelectedIndustry('');
                                setSelectedCompanySize('');
                                setSelectedCompanyType('');
                                setSelectedRating('');
                                setSortBy('');
                                setSelectedTab(0);
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </Paper>
                </Grid>

                {/* Right Content - Companies Listings */}
                <Grid item xs={12} md={9}>
                    {/* Results Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h6" fontWeight="600">
                            {sortedCompanies.length} Companies Found
                        </Typography>
                        {/* View Format Toggle */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Grid View">
                                <IconButton 
                                    onClick={() => setViewMode('grid')}
                                    color={viewMode === 'grid' ? 'primary' : 'default'}
                                >
                                    <ViewModule />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="List View">
                                <IconButton 
                                    onClick={() => setViewMode('list')}
                                    color={viewMode === 'list' ? 'primary' : 'default'}
                                >
                                    <ViewList />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

            {/* Stats */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                {companies.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Companies
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                {companies.reduce((sum, company) => sum + company.openJobs, 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Open Jobs
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                4.2
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Avg Rating
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="h5" color="primary" fontWeight="bold">
                                {companies.reduce((sum, company) => sum + company.reviews, 0).toLocaleString()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Reviews
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Companies Grid/List */}
            <Grid container spacing={3}>
                {sortedCompanies.map((company) => (
                    <Grid item xs={12} md={viewMode === 'grid' ? 6 : 12} lg={viewMode === 'grid' ? 6 : 12} key={company.id}>
                        <CompanyCard company={company} />
                    </Grid>
                ))}
            </Grid>

            {sortedCompanies.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No companies found matching your criteria
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try adjusting your search or filters
                    </Typography>
                </Box>
            )}
                </Grid>
            </Grid>
            </Box>
        </Box>
    );
};

export default CompaniesPage;