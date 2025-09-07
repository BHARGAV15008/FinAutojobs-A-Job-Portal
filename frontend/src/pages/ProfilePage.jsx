import { Redirect } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import ApplicantProfilePage from './ApplicantProfilePage';
import RecruiterProfilePage from './RecruiterProfilePage';

const ProfilePage = () => {
    const { user } = useAuth();

    if (!user) {
        return <Redirect to="/login" />;
    }

    if (user?.role === 'recruiter') {
        return <RecruiterProfilePage />;
    }

    return <ApplicantProfilePage />;
};

export default ProfilePage;
