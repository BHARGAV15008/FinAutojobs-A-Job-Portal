import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

class StressTester {
    constructor() {
        this.results = [];
        this.startTime = null;
        this.endTime = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '⚡',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '⚡';
        
        console.log(`${prefix} ${message}`);
        this.results.push({ timestamp, type, message });
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const startTime = Date.now();
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            const data = await response.json();
            return { response, data, status: response.status, responseTime };
        } catch (error) {
            return { error: error.message, status: 0, responseTime: 0 };
        }
    }

    async runConcurrentRequests(endpoint, count, options = {}) {
        const requests = [];
        for (let i = 0; i < count; i++) {
            requests.push(this.makeRequest(endpoint, options));
        }
        
        const startTime = Date.now();
        const results = await Promise.all(requests);
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        const successful = results.filter(r => r.status === 200).length;
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
        
        return {
            total: count,
            successful,
            failed: count - successful,
            totalTime,
            avgResponseTime,
            successRate: (successful / count) * 100
        };
    }

    async runStressTests() {
        console.log('⚡ Starting Advanced Stress Testing\n');
        this.startTime = Date.now();

        // Test 1: High concurrent health checks
        this.log('Testing 50 concurrent health check requests');
        const healthTest = await this.runConcurrentRequests('/health', 50);
        this.log(`Health stress test: ${healthTest.successful}/${healthTest.total} successful (${healthTest.successRate.toFixed(1)}%) in ${healthTest.totalTime}ms`, 
                 healthTest.successRate > 90 ? 'success' : 'warning');

        // Test 2: Concurrent job listings
        this.log('Testing 30 concurrent job listing requests');
        const jobsTest = await this.runConcurrentRequests('/jobs', 30);
        this.log(`Jobs stress test: ${jobsTest.successful}/${jobsTest.total} successful (${jobsTest.successRate.toFixed(1)}%) in ${jobsTest.totalTime}ms`,
                 jobsTest.successRate > 90 ? 'success' : 'warning');

        // Test 3: Concurrent user registrations
        this.log('Testing 20 concurrent user registrations');
        const registrationPromises = [];
        for (let i = 0; i < 20; i++) {
            const userData = {
                username: `stress_user_${Date.now()}_${i}`,
                email: `stress${i}@test.com`,
                password: 'StressTest123!',
                full_name: `Stress Test User ${i}`,
                role: 'jobseeker'
            };
            registrationPromises.push(this.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            }));
        }
        
        const regResults = await Promise.all(registrationPromises);
        const regSuccessful = regResults.filter(r => r.status === 201 || r.status === 200).length;
        this.log(`Registration stress test: ${regSuccessful}/20 successful (${(regSuccessful/20*100).toFixed(1)}%)`,
                 regSuccessful > 18 ? 'success' : 'warning');

        // Test 4: Mixed endpoint stress test
        this.log('Testing 100 mixed endpoint requests');
        const mixedRequests = [];
        const endpoints = ['/health', '/jobs', '/companies', '/oauth/config'];
        
        for (let i = 0; i < 100; i++) {
            const endpoint = endpoints[i % endpoints.length];
            mixedRequests.push(this.makeRequest(endpoint));
        }
        
        const mixedStartTime = Date.now();
        const mixedResults = await Promise.all(mixedRequests);
        const mixedEndTime = Date.now();
        const mixedSuccessful = mixedResults.filter(r => r.status === 200).length;
        
        this.log(`Mixed endpoint stress test: ${mixedSuccessful}/100 successful (${mixedSuccessful}%) in ${mixedEndTime - mixedStartTime}ms`,
                 mixedSuccessful > 90 ? 'success' : 'warning');

        // Test 5: Rapid sequential requests
        this.log('Testing rapid sequential requests (no delay)');
        const sequentialResults = [];
        const sequentialStartTime = Date.now();
        
        for (let i = 0; i < 50; i++) {
            const result = await this.makeRequest('/health');
            sequentialResults.push(result);
        }
        
        const sequentialEndTime = Date.now();
        const sequentialSuccessful = sequentialResults.filter(r => r.status === 200).length;
        
        this.log(`Sequential stress test: ${sequentialSuccessful}/50 successful (${sequentialSuccessful*2}%) in ${sequentialEndTime - sequentialStartTime}ms`,
                 sequentialSuccessful > 45 ? 'success' : 'warning');

        // Test 6: Memory and performance monitoring
        this.log('Testing sustained load (5 seconds of continuous requests)');
        const sustainedStartTime = Date.now();
        const sustainedResults = [];
        
        while (Date.now() - sustainedStartTime < 5000) {
            const result = await this.makeRequest('/health');
            sustainedResults.push(result);
        }
        
        const sustainedSuccessful = sustainedResults.filter(r => r.status === 200).length;
        this.log(`Sustained load test: ${sustainedSuccessful}/${sustainedResults.length} successful (${(sustainedSuccessful/sustainedResults.length*100).toFixed(1)}%) over 5 seconds`,
                 sustainedSuccessful/sustainedResults.length > 0.9 ? 'success' : 'warning');

        this.endTime = Date.now();
        
        // Generate summary
        const totalTestTime = this.endTime - this.startTime;
        const successfulTests = this.results.filter(r => r.type === 'success').length;
        const totalTests = this.results.filter(r => r.type === 'success' || r.type === 'warning' || r.type === 'error').length;
        
        console.log(`\n📊 Stress Testing Complete!`);
        console.log(`⏱️ Total test duration: ${totalTestTime}ms`);
        console.log(`✅ Successful stress tests: ${successfulTests}/${totalTests} (${(successfulTests/totalTests*100).toFixed(1)}%)`);
        
        return {
            totalTestTime,
            successfulTests,
            totalTests,
            successRate: (successfulTests/totalTests*100).toFixed(1),
            results: this.results
        };
    }
}

const tester = new StressTester();
tester.runStressTests().catch(console.error);
