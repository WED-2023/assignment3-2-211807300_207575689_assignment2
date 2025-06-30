<template>
  <div class="search-page">
    <div class="search-header">
      <h1>🔍 חיפוש מתכונים</h1>
      <p>מצא את המתכון המושלם עבורך</p>
    </div>

    <div class="search-form-container">
      <form @submit.prevent="searchRecipes" class="search-form">
        <!-- Recipe Name/Query -->
        <div class="form-group">
          <label>שם המתכון או מילת מפתח:</label>
          <input 
            v-model="searchParams.query" 
            type="text" 
            class="form-control" 
            placeholder="לדוגמה: לזניה, עוגת שוקולד..."
            required
          />
        </div>

        <div class="form-row">
          <!-- Cuisine -->
          <div class="form-group">
            <label>סוג מטבח:</label>
            <select v-model="searchParams.cuisine" class="form-control">
              <option value="">כל סוגי המטבח</option>
              <option v-for="cuisine in cuisines" :key="cuisine.value" :value="cuisine.value">
                {{ cuisine.label }}
              </option>
            </select>
          </div>

          <!-- Diet -->
          <div class="form-group">
            <label>סוג דיאטה:</label>
            <select v-model="searchParams.diet" class="form-control">
              <option value="">ללא הגבלה</option>
              <option v-for="diet in diets" :key="diet.value" :value="diet.value">
                {{ diet.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <!-- Intolerance -->
          <div class="form-group">
            <label>אלרגיות ואי סבילות:</label>
            <select v-model="searchParams.intolerance" class="form-control">
              <option value="">ללא הגבלה</option>
              <option v-for="intolerance in intolerances" :key="intolerance.value" :value="intolerance.value">
                {{ intolerance.label }}
              </option>
            </select>
          </div>

          <!-- Sort By -->
          <div class="form-group">
            <label>מיון לפי:</label>
            <select v-model="searchParams.sortBy" class="form-control">
              <option value="">ברירת מחדל</option>
              <option value="duration">זמן הכנה</option>
              <option value="popularity">פופולריות</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <!-- Limit -->
          <div class="form-group">
            <label>מספר תוצאות:</label>
            <select v-model="searchParams.limit" class="form-control">
              <option value="5">5 מתכונים</option>
              <option value="10">10 מתכונים</option>
              <option value="15">15 מתכונים</option>
            </select>
          </div>

          <div class="form-group">
            <button type="submit" class="btn btn-primary search-btn" :disabled="isLoading">
              <span v-if="isLoading">מחפש...</span>
              <span v-else>🔍 חפש מתכונים</span>
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>מחפש מתכונים מדהימים עבורך...</p>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <div class="alert alert-danger">
        {{ errorMessage }}
      </div>
    </div>

    <!-- Results -->
    <div v-if="searchResults.length > 0 && !isLoading" class="results-section">
      <div class="results-header">
        <h3>נמצאו {{ searchResults.length }} מתכונים</h3>
      </div>
      
      <div class="recipe-grid">
        <div 
          v-for="recipe in searchResults" 
          :key="recipe.id" 
          class="recipe-card"
          @click="openRecipe(recipe.id)"
        >
          <div class="recipe-image-container">
            <img 
              :src="recipe.image" 
              :alt="recipe.title" 
              class="recipe-image"
              @error="handleImageError"
            />
          </div>
          
          <div class="recipe-content">
            <h4 class="recipe-title">{{ recipe.title }}</h4>
            
            <div class="recipe-meta">
              <span class="duration">⏱️ {{ recipe.duration }} דקות</span>
              <span class="likes">❤️ {{ recipe.likes }} לייקים</span>
            </div>
            
            <div class="recipe-badges">
              <span v-if="recipe.vegan" class="badge badge-vegan">טבעוני</span>
              <span v-else-if="recipe.vegetarian" class="badge badge-vegetarian">צמחוני</span>
              <span v-if="recipe.glutenFree" class="badge badge-gluten-free">ללא גלוטן</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="searchResults.length === 0 && hasSearched && !isLoading" class="no-results">
      <h3>😔 לא נמצאו תוצאות</h3>
      <p>נסה לשנות את תנאי החיפוש או להרחיב את הקריטריונים</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

export default {
  name: 'SearchPage',
  setup() {
    const router = useRouter();
    
    const searchParams = reactive({
      query: '',
      cuisine: '',
      diet: '',
      intolerance: '',
      sortBy: '',
      limit: '5'
    });

    const searchResults = ref([]);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const hasSearched = ref(false);

    const cuisines = ref([
      { value: 'Italian', label: 'איטלקי' },
      { value: 'Chinese', label: 'סיני' },
      { value: 'Mexican', label: 'מקסיקני' },
      { value: 'Indian', label: 'הודי' },
      { value: 'French', label: 'צרפתי' },
      { value: 'Mediterranean', label: 'ים תיכוני' },
      { value: 'American', label: 'אמריקאי' },
      { value: 'Thai', label: 'תאילנדי' },
      { value: 'Japanese', label: 'יפני' },
      { value: 'Greek', label: 'יווני' }
    ]);

    const diets = ref([
      { value: 'vegan', label: 'טבעוני' },
      { value: 'vegetarian', label: 'צמחוני' },
      { value: 'ketogenic', label: 'קטוגני' },
      { value: 'paleo', label: 'פליאו' },
      { value: 'whole30', label: 'Whole30' },
      { value: 'gluten free', label: 'ללא גלוטן' }
    ]);

    const intolerances = ref([
      { value: 'gluten', label: 'גלוטן' },
      { value: 'dairy', label: 'חלב' },
      { value: 'egg', label: 'ביצים' },
      { value: 'peanut', label: 'בוטנים' },
      { value: 'tree nut', label: 'אגוזים' },
      { value: 'soy', label: 'סויה' },
      { value: 'shellfish', label: 'פירות ים' },
      { value: 'sesame', label: 'שומשום' }
    ]);

    const buildSearchURL = () => {
      const params = new URLSearchParams();
      
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key] && searchParams[key].trim()) {
          params.append(key, searchParams[key].trim());
        }
      });
      
      return `/recipes/search?${params.toString()}`;
    };

    const searchRecipes = async () => {
      isLoading.value = true;
      errorMessage.value = '';
      hasSearched.value = true;
      
      try {
        const url = buildSearchURL();
        console.log('Searching with URL:', url);
        
        const response = await axios.get(url);
        searchResults.value = response.data || [];
        
        console.log('Search results:', searchResults.value);
      } catch (error) {
        console.error('Search error:', error);
        
        if (error.response?.status === 404) {
          errorMessage.value = 'לא נמצאו מתכונים התואמים לחיפוש שלך';
        } else if (error.response?.status >= 500) {
          errorMessage.value = 'שגיאה בשרת. אנא נסה שוב מאוחר יותר';
        } else {
          errorMessage.value = 'אירעה שגיאה בחיפוש. אנא נסה שוב';
        }
        
        searchResults.value = [];
      } finally {
        isLoading.value = false;
      }
    };

    const openRecipe = (recipeId) => {
      router.push(`/recipes/${recipeId}`);
    };

    const handleImageError = (event) => {
      event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPteh15vXlSDYgdeh15nXmSDXoNeZ15vXnSDXntiq15vXlden</text></svg>';
    };

    return {
      searchParams,
      searchResults,
      isLoading,
      errorMessage,
      hasSearched,
      cuisines,
      diets,
      intolerances,
      searchRecipes,
      openRecipe,
      handleImageError
    };
  }
};
</script>

<style scoped>
.search-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.search-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 30px;
  background: linear-gradient(45deg, #ff6b6b, #ffd93d);
  border-radius: 15px;
  color: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.search-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.search-form-container {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  font-size: 0.9rem;
}

.form-control {
  padding: 12px 15px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-btn {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
}

.search-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-bottom: 20px;
}

.alert {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: #ffe6e6;
  color: #cc0000;
  border: 1px solid #ffcccc;
}

.results-section {
  margin-top: 30px;
}

.results-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.results-header h3 {
  color: #333;
  font-size: 1.3rem;
}

.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 25px;
}

.recipe-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.recipe-image-container {
  height: 200px;
  overflow: hidden;
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-content {
  padding: 20px;
}

.recipe-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  color: #333;
  line-height: 1.4;
}

.recipe-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  font-size: 0.9rem;
  color: #666;
}

.recipe-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-vegan {
  background: #e8f5e8;
  color: #2d5a2d;
}

.badge-vegetarian {
  background: #fff3cd;
  color: #856404;
}

.badge-gluten-free {
  background: #d1ecf1;
  color: #0c5460;
}

.no-results {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 10px;
  color: #999;
}

@media (max-width: 768px) {
  .search-header h1 {
    font-size: 2rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .recipe-grid {
    grid-template-columns: 1fr;
  }
  
  .search-form-container {
    padding: 20px;
  }
}
</style>