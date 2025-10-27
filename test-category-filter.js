const API_TOKEN = 'cms_4iL1SEEXB7oQoiYDEfNJBTpeHeFVLP3k';
const BASE_URL = 'https://cms.nexjob.tech/api/v1';

async function testCategoryFilter() {
  console.log('=== Testing Category Filter ===');
  
  // Get demo job
  const jobRes = await fetch(`${BASE_URL}/job-posts/d071b083-1fc7-45f9-9541-8402ec2f2bd1`, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });
  const jobData = await jobRes.json();
  const categoryId = jobData.data.job_categories[0].id;
  
  console.log('Category ID:', categoryId);
  console.log('Category Name:', jobData.data.job_categories[0].name);
  
  // Test the correct API call
  console.log('\n=== Calling API with job_category parameter ===');
  const url = `${BASE_URL}/job-posts?job_category=${categoryId}&status=published&page=1&limit=5`;
  console.log('URL:', url);
  
  const filterRes = await fetch(url, {
    headers: { 'Authorization': `Bearer ${API_TOKEN}` }
  });
  
  console.log('Status:', filterRes.status);
  const filterData = await filterRes.json();
  
  if (filterData.success) {
    console.log('✓ SUCCESS - Found', filterData.data.posts.length, 'jobs');
    filterData.data.posts.forEach(job => {
      console.log(`  - ${job.title} (${job.id})`);
    });
  } else {
    console.log('✗ FAILED');
    console.log(filterData);
  }
}

testCategoryFilter().catch(console.error);
